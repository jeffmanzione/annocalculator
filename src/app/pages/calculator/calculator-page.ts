import { Clipboard } from '@angular/cdk/clipboard';
import { effect, inject, Injector, Provider } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { GAME, GameDefinition } from '../../games/game';
import { EntityId } from '../../shared/engine/base-world-store';
import {
  LocalStorageManager,
  StorageItem,
} from '../../services/local-storage/local-storage';
import { DefaultAction } from './calculator-column/calculator-column';
import { SaveData, SaveDialog } from './save-dialog/save-dialog';

/** What a calculator page provides to what it contains: the game, and how form fields look. */
export const calculatorProviders = (game: GameDefinition): Provider[] => [
  { provide: GAME, useValue: game },
  {
    provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
    useValue: { appearance: 'outline', subscriptSizing: 'dynamic' },
  },
];

/**
 * What both games' calculator pages do the same way with their saved world: keep it in the browser's
 * local storage under the game's own key, save it again after every change, and offer the default
 * actions (copy it, edit it as JSON, reset it, clear it). Importing, resetting and clearing store the new
 * world and reload the page, so the world's stores and controllers stay the same for a page's life.
 *
 * `Save` is the world as it is saved and copied.
 */
export abstract class CalculatorPage<Save extends object> {
  readonly defaultActions: DefaultAction[] = [
    {
      icon: 'content_copy',
      fn: () => this.copyJsonToClipboard_(),
      tooltip: 'Copy the JSON representation of your inputs to your clipboard.',
    },
    {
      icon: 'edit_square',
      fn: () => this.openSaveDialog_(),
      tooltip: 'Manually edit the JSON inputs.',
    },
    {
      icon: 'refresh',
      fn: () => this.setSaveAndReload_(this.defaultSave_()),
      tooltip: 'Reset the inputs to a default example.',
    },
    {
      icon: 'delete',
      fn: () => this.setSaveAndReload_(this.emptySave_()),
      tooltip: 'Completely clear the inputs.',
    },
  ];

  protected readonly injector_ = inject(Injector);
  protected readonly worldStorage_: StorageItem<Save>;
  private readonly matDialog_ = inject(MatDialog);
  private readonly clipboard_ = inject(Clipboard);

  protected constructor(
    storageManager: LocalStorageManager,
    storageKey: string,
  ) {
    this.worldStorage_ = storageManager.lookupObjectItem(storageKey);
  }

  /** The page's world controller, which the island list adds and removes islands through. */
  abstract world: {
    addIsland(): unknown;
    removeIsland(id: EntityId): void;
  };

  addIsland(): void {
    this.world.addIsland();
  }

  removeIsland(id: EntityId): void {
    this.world.removeIsland(id);
  }

  /** The world as it is saved now. */
  protected abstract currentSave_(): Save;
  protected abstract defaultSave_(): Save;
  protected abstract emptySave_(): Save;

  /** Checks a world typed or pasted into the editor, returning it as a save; throws if it is not one. */
  protected readSave_(edited: Save): Save {
    return edited;
  }

  /** Called when what was typed into the editor was not accepted (nothing is stored then). */
  protected rejectSave_(_error: unknown): void {}

  /** The saved world, or the starter world for a first visit or if what is stored cannot be read. */
  protected loadSave_(): Save {
    try {
      const stored = this.worldStorage_.get();
      if (stored) return this.readSave_(stored);
    } catch (error) {
      console.warn(
        'The saved world could not be read; starting from the default world.',
        error,
      );
    }
    return this.defaultSave_();
  }

  /**
   * Saves the world whenever anything in it changes, and once on load (which writes an older save in its
   * current form). The save reads every signal the world is made of, so this runs after any write from
   * any component, and a burst of writes from one action saves once. Call it once the world exists.
   */
  protected persistWhenChanged_(): void {
    effect(() => this.worldStorage_.set(this.currentSave_()), {
      injector: this.injector_,
    });
  }

  protected setSaveAndReload_(save: Save): void {
    if (!save) return;
    this.worldStorage_.set(save);
    globalThis.location.reload();
  }

  private copyJsonToClipboard_(): void {
    this.clipboard_.copy(JSON.stringify(this.currentSave_()));
  }

  private openSaveDialog_(): void {
    const config: MatDialogConfig<SaveData<Save>> = {
      data: { obj: this.currentSave_() },
      width: '600px',
      height: '700px',
    };
    this.matDialog_
      .open(SaveDialog, config)
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        try {
          // Checked before anything is stored, so a world from the wrong game or a typo cannot break the page.
          this.setSaveAndReload_(this.readSave_(result));
        } catch (error) {
          this.rejectSave_(error);
        }
      });
  }
}
