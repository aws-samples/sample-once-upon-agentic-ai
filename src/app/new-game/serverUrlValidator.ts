import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function serverUrlValidator(
  control: AbstractControl
): Promise<ValidationErrors | null> {

  const value = control.value;

  if (!value) {
    return Promise.resolve({ invalidUrl: true });
  }

  try {
    new URL(value);
  } catch {
    return Promise.resolve({ invalidUrl: true });
  }

  return fetch(`${value}/health`)
    .then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        if (data.status === "healthy") {
            return null
        }
        return { status: "unhealthy"};
      }
      return {
        unreachable: true,
      };
    })
    .catch(() => {
      return {
        unreachable: true,
      };
    });
}
