/**
 * Selects an initial zero when a numeric field receives focus so typing a
 * value replaces 0 instead of appending to it (for example, 5 instead of 05).
 */
export function installNumberInputBehavior(): () => void {
  const selectInitialZero = (event: FocusEvent) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== "number" || input.value !== "0") {
      return;
    }

    window.requestAnimationFrame(() => {
      if (document.activeElement === input && input.value === "0") input.select();
    });
  };

  const allowInitialZeroDeletion = (event: KeyboardEvent) => {
    const input = event.target;
    if (
      !(input instanceof HTMLInputElement) ||
      input.type !== "number" ||
      input.value !== "0" ||
      (event.key !== "Backspace" && event.key !== "Delete")
    ) {
      return;
    }

    // Numeric form state is parsed on every keystroke in several existing
    // forms. Clear the DOM value without emitting a change event so the user
    // can continue typing or leave the field empty while it is focused.
    event.preventDefault();
    input.value = "";
  };

  document.addEventListener("focusin", selectInitialZero);
  document.addEventListener("keydown", allowInitialZeroDeletion);
  return () => {
    document.removeEventListener("focusin", selectInitialZero);
    document.removeEventListener("keydown", allowInitialZeroDeletion);
  };
}
