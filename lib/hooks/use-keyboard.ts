'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

export function useKeyboard() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const showListener = Keyboard.addListener('keyboardWillShow', (info) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(info.keyboardHeight);
    });

    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
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
