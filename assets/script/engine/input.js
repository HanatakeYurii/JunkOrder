var Input =
        {
            KeyBoard:
                    {
                        Ignored: {91: true, 116: true, 123: true}, // Win/Mac key
                        Modifiers: {16: false, 17: false, 18: false}, // Shift, Ctrl, Alt keys
                        Pushed: {},
                        Repeat: {},
                        ignoreSomeKeys: true,
                        useModifiers: false,
                        preventDefault: true,
                        stopPropagation: true,
                        enable: function ()
                        {
                            window.addEventListener("keydown", Input.KeyBoard.push);
                            window.addEventListener("keyup", Input.KeyBoard.release);
                        },
                        disable: function ()
                        {
                            window.removeEventListener("keydown", Input.KeyBoard.push);
                            window.removeEventListener("keyup", Input.KeyBoard.release);
                        },
                        push: function (e)
                        {
                            if (!Input.KeyBoard.ignoreSomeKeys || !Input.KeyBoard.Ignored[e.keyCode])
                            {
                                if (Input.KeyBoard.preventDefault)
                                {
                                    e.preventDefault();
                                }
                                if (Input.KeyBoard.stopPropagation)
                                {
                                    e.stopPropagation();
                                }
                                if (Input.KeyBoard.useModifiers && Input.KeyBoard.Modifiers.hasOwnProperty(e.keyCode))
                                {
                                    Input.KeyBoard.Pushed = [];
                                    Input.KeyBoard.Repeat = [];
                                    Input.KeyBoard.Modifiers[e.keyCode] = true;
                                } else
                                {
                                    Input.KeyBoard.Pushed[e.keyCode] = true;
                                    Input.KeyBoard.Repeat[e.keyCode] = e.repeat;
                                }
                            }
                        },
                        release: function (e)
                        {
                            if (!Input.KeyBoard.ignoreSomeKeys || !Input.KeyBoard.Ignored[e.keyCode])
                            {
                                if (Input.KeyBoard.useModifiers && Input.KeyBoard.Modifiers.hasOwnProperty(e.keyCode))
                                {
                                    Input.KeyBoard.Pushed = [];
                                    Input.KeyBoard.Repeat = [];
                                    Input.KeyBoard.Modifiers[e.keyCode] = false;
                                } else
                                {
                                    delete Input.KeyBoard.Pushed[e.keyCode];
                                    delete Input.KeyBoard.Repeat[e.keyCode];
                                }
                            }
                        },
                        charToKeyCode : function (char, idx = 0)
                        {
                            return char.charCodeAt(idx)-32;
                        }
                    },
            Mouse:
                    {
                        enable: function ()
                        {
                            window.addEventListener("mouseup", Input.Mouse.push);
                            window.addEventListener("mousedown", Input.Mouse.release);
                            window.addEventListener("mousemove", Input.Mouse.move);
                        },
                        disable: function ()
                        {
                            window.removeEventListener("mouseup", Input.Mouse.push);
                            window.removeEventListener("mousedown", Input.Mouse.release);
                            window.removeEventListener("mousemove", Input.Mouse.move);
                        },
                        push: function (e)
                        {
                            
                        },
                        release: function (e)
                        {
                            
                        },
                        move: function (e)
                        {
                            
                        }
                    }
        };