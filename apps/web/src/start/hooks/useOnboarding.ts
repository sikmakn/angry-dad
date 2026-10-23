import { useEffect, useRef, useState } from 'react';
import type { Gender, Me, Role, Schema } from '../../api/contract';
import { useWrite } from '../../hooks/useApi';

type OnboardingStep = 1 | 2 | 3 | 4;

export function useOnboarding(me: Me, finished: () => void) {
  const [step, setStep] = useState<OnboardingStep>(1);
  const [role, setRole] = useState<Role>();
  const [gender, setGender] = useState<Gender>();
  const [result, setResult] = useState<Schema<'OnboardingResponse'>>();
  const save = useWrite(me.id, 'completeOnboarding');
  const active = useRef(true);
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  async function next() {
    if (save.isPending) {
      return;
    }
    if (step === 1) {
      if (role) {
        setStep(2);
      }
    } else if (step === 2 && role && gender) {
      try {
        const response = await save.run({ body: { role, gender, timeZone: zone || 'Europe/Moscow' } });
        if (response && active.current) {
          setResult(response);
          setStep(3);
        }
      } catch { /* Feedback preserves selection. */ }
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      finished();
    }
  }
  const back = () => {
    if (!save.isPending && step === 2) {
      setStep(1);
    }
  };
  return { step, role, setRole, gender, setGender, result, save, zone, next, back };
}
