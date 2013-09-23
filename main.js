/*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets */

define(function (require, exports, module) {
    "use strict";

    var EditorManager           = brackets.getModule("editor/EditorManager"),
        CommandManager          = brackets.getModule("command/CommandManager"),
        Menus                   = brackets.getModule("command/Menus"),
        AppInit                 = brackets.getModule("utils/AppInit");

    var index = 1,
        previousLastChangePos = null;

    function nextEditPosition() {
        var editor  = EditorManager.getFocusedEditor();
        
        if (!editor) {
            return;
        }
        
        var cm      = editor._codeMirror,
            doc     = cm.doc,
            history = doc.getHistory();

        if (history.done.length > 0) {
            var currentLastChangePos = history.done[history.done.length - 1].anchorBefore,
                cursor = cm.getCursor(),
                change = null;
            
            if (currentLastChangePos !== previousLastChangePos) {
                index = 1;
            }
            previousLastChangePos = currentLastChangePos;
            

            if (history.done.length >= index && index > 1) {
                do {
                    change = history.done[history.done.length - (--index)].anchorBefore;
                } while (change.line === cursor.line && history.done.length >= index && index > 1);
                
                if (change !== null && change.line !== cursor.line) {
                    cm.setCursor(change);
                }
            }
            
        } else {
            previousLastChangePos = null;
        }
    }
    
    function previousEditPosition() {
        var editor  = EditorManager.getFocusedEditor();
        
        if (!editor) {
            return;
        }
        
        var cm      = editor._codeMirror,
            doc     = cm.doc,
            history = doc.getHistory();

        if (history.done.length > 0) {
            var currentLastChangePos = history.done[history.done.length - 1].anchorBefore,
                cursor = cm.getCursor(),
                change = null;
            
            if (currentLastChangePos !== previousLastChangePos) {
                index = 1;
            }
            previousLastChangePos = currentLastChangePos;

            if (history.done.length > index && index >= 0) {
                do {
                    change = history.done[history.done.length - (++index)].anchorBefore;
                } while (change.line === cursor.line && history.done.length > index && index >= 0);
                
                if (change !== null && change.line !== cursor.line) {
                    cm.setCursor(change);
                }
            }
        } else {
            previousLastChangePos = null;
        }
    }

    // load everything when brackets is done loading
    AppInit.appReady(function () {
        var NAVIGATE_EDIT_FORWARD = "navigate.edit.forward";
        var NAVIGATE_EDIT_BACKWARD = "navigate.edit.backward";
        
        var CMD_EDIT_FORWARD = "Next Edit Position";
        var CMD_EDIT_BACKWARD = "Previous Edit Position";

        CommandManager.register(CMD_EDIT_BACKWARD, NAVIGATE_EDIT_BACKWARD, previousEditPosition);
        CommandManager.register(CMD_EDIT_FORWARD, NAVIGATE_EDIT_FORWARD, nextEditPosition);
        
        var menu = Menus.getMenu(Menus.AppMenuBar.NAVIGATE_MENU);
        menu.addMenuItem(Menus.DIVIDER);
        menu.addMenuItem(NAVIGATE_EDIT_BACKWARD, [{key: "Ctrl-{", platform: "win"},
                                                  {key: "Cmd-{", platform: "mac"}]);
        menu.addMenuItem(NAVIGATE_EDIT_FORWARD, [{key: "Ctrl-}", platform: "win"},
                                                  {key: "Cmd-}", platform: "mac"}]);
    });
    
});
