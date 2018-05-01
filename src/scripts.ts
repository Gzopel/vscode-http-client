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

 /**
  * Options for 'executeScript()' function.
  */
export interface ExecuteScriptOptions {
    /**
     * The cancellation token.
     */
    cancelToken: any;
    /**
     * The code to execute.
     */
    code: string;
    /**
     * The request handler.
     */
    handler: any;
    /**
     * An 'onDidSend' event listener.
     */
    onDidSend: Function;
    /**
     * The progress context.
     */
    progress: any;
    /**
     * The request data.
     */
    request: any;
}

/**
 * Executes a script.
 *
 * @param {ExecuteScriptOptions} _e0bcc1df_3f0b_4a19_9e42_238d7fe990c5 The (obfuscated) options.
 *
 * @return {Promise<any>} The promise with the result.
 */
export async function executeScript(_e0bcc1df_3f0b_4a19_9e42_238d7fe990c5: ExecuteScriptOptions) {
    const $moment = require('moment');
    require('moment-timezone');

    const $fs = require('fs-extra');
    const $h = require('vscode-helpers');
    const $uuid = require('uuid');
    const $vs = require('vscode');

    const cancel = _e0bcc1df_3f0b_4a19_9e42_238d7fe990c5.cancelToken;
    const from = $h.from;
    const new_request = () => {
        const REQ = new (require('./http').HTTPClient)(
            _e0bcc1df_3f0b_4a19_9e42_238d7fe990c5.handler,
            _e0bcc1df_3f0b_4a19_9e42_238d7fe990c5.request,
        );

        REQ.onDidSend(async function() {
            const THIS_ARGS = _e0bcc1df_3f0b_4a19_9e42_238d7fe990c5;
            const ON_DID_SEND = THIS_ARGS.onDidSend;

            return await Promise.resolve(
                ON_DID_SEND.apply(THIS_ARGS, arguments)
            );
        });

        return REQ;
    };
    const now = () => {
        return $moment();
    };
    const progress = _e0bcc1df_3f0b_4a19_9e42_238d7fe990c5.progress;
    const sleep = async (secs?: number) => {
        let ms = Math.floor( parseFloat($h.toStringSafe(secs).trim()) * 1000.0 );
        if (isNaN(ms)) {
            ms = undefined;
        }

        await $h.sleep(ms);
    };
    const utc = () => {
        return $moment.utc();
    };

    return await Promise.resolve(
        eval(`(async () => {

${ $h.toStringSafe(_e0bcc1df_3f0b_4a19_9e42_238d7fe990c5.code) }

});`)()
    );
}