import * as vscode from 'vscode';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  context.subscriptions.push(
    vscode.commands.registerCommand('rushstack.selectWorkspace', async () => {
      await vscode.window.showInformationMessage('Testing world');
      //     await RushWorkspace.selectWorkspace();
    })
  );
  console.log('testing...');
}

export function deactivate(): void {}
