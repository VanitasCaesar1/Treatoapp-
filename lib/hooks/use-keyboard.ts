'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

export function useKeyboard() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let showHandle: any = null;
    let hideHandle: any = null;

    // addListener returns a Promise, so we need to await it
    Keyboard.addListener('keyboardWillShow', (info) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(info.keyboardHeight);
    }).then((handle) => {
      showHandle = handle;
    });

    Keyboard.addListener('keyboardWillHide', () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    }).then((handle) => {
      hideHandle = handle;
    });

    return () => {
      if (showHandle) showHandle.remove();
      if (hideHandle) hideHandle.remove();
    };
  }, []);

  const hideKeyboard = async () => {
    if (Capacitor.isNativePlatform()) {
      await Keyboard.hide();
    }
  };

  return {
    isKeyboardVisible,
    keyboardHeight,
    hideKeyboard,
  };
}
