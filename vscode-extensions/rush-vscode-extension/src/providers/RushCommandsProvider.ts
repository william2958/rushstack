import * as vscode from 'vscode';
import { terminal } from '../logic/logger';
import { RushWorkspace } from '../logic/RushWorkspace';
import { RushCommandWebViewPanel } from '../logic/RushCommandWebViewPanel';

import type { CommandLineAction } from '@rushstack/rush-vscode-command-webview';

interface IRushCommandParams {
  label: string;
  collapsibleState: vscode.TreeItemCollapsibleState;
  commandLineAction: CommandLineAction;
}

class RushCommand extends vscode.TreeItem {
  public readonly commandLineAction: CommandLineAction;
  public constructor({ label, collapsibleState, commandLineAction }: IRushCommandParams) {
    super(label, collapsibleState);
    this.contextValue = 'rushCommand';
    this.commandLineAction = commandLineAction;
    this.command = {
      title: 'Run Rush Command',
      command: 'rushstack.rushCommands.runRushCommand',
      arguments: [this]
    };
  }
}

export class RushCommandsProvider implements vscode.TreeDataProvider<RushCommand> {
  private _context: vscode.ExtensionContext;
  private _commandLineActions: CommandLineAction[] | undefined;
  private readonly _onDidChangeTreeData: vscode.EventEmitter<RushCommand | undefined> =
    new vscode.EventEmitter();

  public readonly onDidChangeTreeData: vscode.Event<RushCommand | undefined> =
    this._onDidChangeTreeData.event;

  public constructor(context: vscode.ExtensionContext) {
    this._context = context;
    const rushWorkspace: RushWorkspace = RushWorkspace.getCurrentInstance();
    terminal.writeDebugLine('rush workspace: ', JSON.stringify(rushWorkspace.commandLineActions));
    console.log('rush command line actions: ', rushWorkspace.commandLineActions);
    RushWorkspace.onDidChangeWorkspace((rushWorkspace: RushWorkspace) => {
      this._commandLineActions = rushWorkspace.commandLineActions;
      this.refresh();
    });
    this._commandLineActions = rushWorkspace.commandLineActions;
    terminal.writeDebugLine(
      'command line actions: ',
      this._commandLineActions.map((cli) => cli.actionName).join(',')
    );

    const commandNames: readonly ['openParameterViewPanel', 'runRushCommand'] = [
      'openParameterViewPanel',
      'runRushCommand'
    ] as const;

    for (const commandName of commandNames) {
      const handler:
        | (() => Promise<void>)
        | ((element?: RushCommand) => Promise<void>)
        | ((element: RushCommand) => Promise<void>) = this[`${commandName}Async`];
      context.subscriptions.push(
        vscode.commands.registerCommand(`rushstack.rushCommands.${commandName}`, handler, this)
      );
    }
  }

  public refresh(): void {
    terminal.writeDebugLine('Refreshing Rush commands');
    this._onDidChangeTreeData.fire(undefined);
  }

  public async refreshEntryAsync(): Promise<void> {
    this.refresh();
  }

  public async openParameterViewPanelAsync(element: RushCommand): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    return RushCommandWebViewPanel.getInstance(this._context).reveal(element.commandLineAction);
  }

  public async runRushCommandAsync(element?: RushCommand): Promise<void> {
    let rushCommand: RushCommand | undefined = element;
    if (!rushCommand) {
      const actionNames: string[] = this._commandLineActions?.map((action) => action.actionName) || [];
      if (!actionNames.length) {
        terminal.writeErrorLine('No Rush commands available');
        return;
      }
      const commandSelect: string | undefined = await vscode.window.showQuickPick(actionNames, {
        placeHolder: 'Select a Rush command to run',
        onDidSelectItem: (item) => {
          const foundAction: CommandLineAction | undefined = this._commandLineActions?.find(
            (action) => action.actionName === item
          );
          if (foundAction) {
            rushCommand = new RushCommand({
              label: foundAction.actionName,
              collapsibleState: vscode.TreeItemCollapsibleState.None,
              commandLineAction: foundAction
            });
          }
        }
      });
      terminal.writeDebugLine(`Selected command: ${commandSelect}`);
    }

    if (!rushCommand) {
      return;
    }
    terminal.writeDebugLine(`Running command: ${rushCommand.label}`);
    await this.openParameterViewPanelAsync(rushCommand);
  }

  public getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  public getChildren(element?: vscode.TreeItem): Thenable<RushCommand[]> {
    if (!this._commandLineActions) {
      console.error('NO RUSH PROJECTS!');
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      vscode.window.showInformationMessage('No RushProjects in empty workspace');
      return Promise.resolve([]);
    }

    // top-level
    if (!element) {
      terminal.writeDebugLine('top level no element Rush commands');
      return Promise.resolve(
        this._commandLineActions.map(
          (commandLineAction) =>
            new RushCommand({
              label: commandLineAction.actionName,
              collapsibleState: vscode.TreeItemCollapsibleState.None,
              commandLineAction
            })
        )
      );
    }

    return Promise.resolve([]);
  }
}
