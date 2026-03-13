export const enterFullscreen = () => {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
};

export const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
};

export const setupAntiCheat = (onViolation) => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      onViolation({ type: 'tab_switch', message: 'Switched tabs or minimized window' });
    }
  };

  const handleCopyPaste = (e) => {
    e.preventDefault();
    onViolation({ type: 'copy_paste', message: 'Copy/Paste is disabled during the exam', noFullscreenReentry: true });
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    onViolation({ type: 'right_click', message: 'Right click is disabled during the exam' });
  };
  
  const handleFullscreenChange = () => {
    if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
       onViolation({ type: 'fullscreen_exit', message: 'Exited fullscreen mode' });
    }
  };

  const handleKeyDown = (e) => {
    // Prevent F12
    if (e.key === 'F12') {
      e.preventDefault();
      onViolation({ type: 'keyboard_shortcut', message: 'F12 Developer Tools are disabled' });
    }
    // Prevent Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      onViolation({ type: 'keyboard_shortcut', message: 'Developer Tools are disabled' });
    }
    // Prevent Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      onViolation({ type: 'keyboard_shortcut', message: 'View Source is disabled' });
    }
    // Prevent Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey && ['c', 'v', 'x'].includes(e.key.toLowerCase())) {
      // We'll let the copy/paste event handler catch the actual action, 
      // but we can also forcefully block the keys here to be safe.
      e.preventDefault();
      onViolation({ type: 'keyboard_shortcut', message: 'Copy/Paste shortcuts are disabled' });
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  document.addEventListener('copy', handleCopyPaste);
  document.addEventListener('cut', handleCopyPaste);
  document.addEventListener('paste', handleCopyPaste);
  document.addEventListener('contextmenu', handleContextMenu);
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('keydown', handleKeyDown);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('copy', handleCopyPaste);
    document.removeEventListener('cut', handleCopyPaste);
    document.removeEventListener('paste', handleCopyPaste);
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('keydown', handleKeyDown);
  };
};
