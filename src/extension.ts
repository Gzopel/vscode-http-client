'use strict';

/**
 * This file is part of the vscode-http-client distribution.
 * Copyright (c) Marcel Joachim Kloubert.
 *
 * vscode-http-client is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * vscode-http-client is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import * as _ from 'lodash';
import * as FSExtra from 'fs-extra';
import * as Path from 'path';
import * as OS from 'os';
import * as vschc_requests from './requests';
import * as vschc_workspaces from './workspaces';
import * as vscode from 'vscode';
import * as vscode_helpers from 'vscode-helpers';


let extension: vscode.ExtensionContext;
let isDeactivating = false;
let workspaceWatcher: vscode_helpers.WorkspaceWatcherContext<vschc_workspaces.Workspace>;

export function activate(context: vscode.ExtensionContext) {
    extension = context;

    const WF = vscode_helpers.buildWorkflow();

    // user's extension directory
    WF.next(async () => {
        try {
            const EXT_DIR = getUsersExtensionDir();
            if (!(await vscode_helpers.isDirectory(EXT_DIR))) {
                await FSExtra.mkdirs(EXT_DIR);
            }
        } catch (e) {
            showError(e);
        }
    });

    // commands
    WF.next(() => {
        extension.subscriptions.push(
            // newRequest
            vscode.commands.registerCommand('extension.http.client.newRequest', async () => {
                try {
                    await vschc_requests.startNewRequest();
                } catch (e) {
                    showError(e);
                }
            }),

            // newRequestForEditor
            vscode.commands.registerCommand('extension.http.client.newRequestForEditor', async function(file?: vscode.Uri) {
                try {
                    let text: string | false = false;

                    if (arguments.length > 0) {
                        text = await FSExtra.readFile(file.fsPath, 'binary');
                    } else {
                        const EDITOR = vscode.window.activeTextEditor;
                        if (EDITOR && EDITOR.document) {
                            text = EDITOR.document.getText();
                        }
                    }

                    if (false === text) {
                        vscode.window.showWarningMessage(
                            'No editor (content) found!'
                        );
                    } else {
                        await vschc_requests.startNewRequest({
                            body: vscode_helpers.toStringSafe( text ),
                            showOptions: vscode.ViewColumn.Two,
                        });
                    }
                } catch (e) {
                    showError(e);
                }
            }),
        );
    });

    // workspace(s)
    WF.next(async () => {
        extension.subscriptions.push(
            workspaceWatcher = vscode_helpers.registerWorkspaceWatcher(context, async (event, folder, workspace?) => {
                if (event === vscode_helpers.WorkspaceWatcherEvent.Added) {
                    const NEW_WORKSPACE = new vschc_workspaces.Workspace( folder );

                    await NEW_WORKSPACE.initialize();

                    return NEW_WORKSPACE;
                }
            })
        );

        await workspaceWatcher.reload();
    });

    // openRequestsOnStartup
    WF.next(async () => {
        try {
            for (const WF of workspaceWatcher.workspaces) {
                try {
                    if (!WF.isInFinalizeState) {
                        await WF.openRequestsOnStartup();
                    }
                } catch (e) {
                    showError(e);
                }
            }
        } catch (e) {
            showError(e);
        }
    });

    if (!isDeactivating) {
        WF.start().then(() => {}, (err) => {
            showError(err);
        });
    }
}

export function deactivate() {
    if (isDeactivating) {
        return;
    }

    isDeactivating = true;
}

/**
 * Returns the extension's path inside the user's home directory.
 *
 * @return string The path to the (possible) directory.
 */
export function getUsersExtensionDir() {
    return Path.resolve(
        Path.join(
            OS.homedir(), '.vscode-http-client'
        )
    );
}

/**
 * Shows an error.
 *
 * @param {any} err The error to show.
 */
export async function showError(err: any) {
    if (!_.isNil(err)) {
        return await vscode.window.showErrorMessage(
            `[ERROR] '${ vscode_helpers.toStringSafe(err) }'`
        );
    }
}
