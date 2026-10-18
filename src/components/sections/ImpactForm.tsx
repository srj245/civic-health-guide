import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow, Surface } from "@/components/ui/primitives";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { ImpactProfile } from "@/pages/Impact";
import { useT } from "@/i18n";

const AGE_RANGES = ["18–26", "27–44", "45–64", "65+"];
// These VALUES are sent to the server, which whitelists them; only the labels are translated.
const INSURANCE_TYPES = ["Employer", "Marketplace (ACA)", "Medicare", "Medicaid", "Uninsured", "Other"] as const;
const CONCERNS = [
  "Prescription drug costs",
  "Mental health services",
  "Maternal & reproductive care",
  "Chronic conditions",
  "Preventive care",
  "Dental & vision",
  "Veterans health",
  "Rural access to care",
] as const;

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

/** One selectable option style for every step: selected = foreground border on secondary. */
const optionClass = (selected: boolean) =>
  `rounded-md border p-4 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
    selected ? "border-foreground bg-secondary" : "border-border hover:bg-secondary"
  }`;

interface Props {
  onSubmit: (profile: ImpactProfile) => void;
}

const ImpactForm = ({ onSubmit }: Props) => {
  const t = useT();
  const [step, setStep] = useState(0);
  const [ageRange, setAgeRange] = useState("");
  const [insuranceType, setInsuranceType] = useState("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [state, setState] = useState("");

  const toggleConcern = (c: string) => {
    setConcerns((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const canNext =
    (step === 0 && ageRange) ||
    (step === 1 && insuranceType) ||
    (step === 2 && concerns.length > 0) ||
    (step === 3 && state);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onSubmit({ ageRange, insuranceType, concerns, state });
  };

  const steps = [
    {
      title: t("impact.q.age"),
      content: (
        <div className="grid grid-cols-2 gap-3">
          {AGE_RANGES.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={ageRange === a}
              onClick={() => setAgeRange(a)}
              className={`${optionClass(ageRange === a)} text-center`}
            >
              {a}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: t("impact.q.insurance"),
      content: (
        <div className="grid grid-cols-2 gap-3">
          {INSURANCE_TYPES.map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={insuranceType === v}
              onClick={() => setInsuranceType(v)}
              className={`${optionClass(insuranceType === v)} text-center`}
            >
              {t(`impact.ins.${v}`)}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: t("impact.q.concerns"),
      content: (
        <div className="flex flex-wrap gap-2">
          {CONCERNS.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={concerns.includes(c)}
              onClick={() => toggleConcern(c)}
              className={`${optionClass(concerns.includes(c))} px-3 py-2`}
            >
              {t(`impact.concern.${c}`)}
            </button>
          ))}
          <p className="mt-1 w-full text-xs text-muted-foreground">{t("impact.selectAll")}</p>
        </div>
      ),
    },
    {
      title: t("impact.q.state"),
      content: (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
          {US_STATES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={state === s}
              onClick={() => setState(s)}
              className={`${optionClass(state === s)} min-h-10 p-2.5 text-center text-xs`}
            >
              {s}
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Surface padding="lg">
      <div
        className="mb-6 flex items-center gap-2"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={step + 1}
        aria-label={t("impact.progress")}
      >
        {steps.map((_, i) => (
          <div key={i} className={`bar-ease h-1.5 flex-1 rounded ${i <= step ? "bg-foreground" : "bg-border"}`} />
        ))}
      </div>

      <Eyebrow className="mb-3">{t("impact.step", { n: step + 1, total: steps.length })}</Eyebrow>
      <h2 className="mb-6 text-2xl tracking-tight text-foreground">{steps[step].title}</h2>
      {steps[step].content}

      <div className="mt-8 flex justify-between max-sm:sticky max-sm:bottom-0 max-sm:-mx-6 max-sm:border-t max-sm:border-border max-sm:bg-card max-sm:px-6 max-sm:py-3">
        <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t("common.back")}
        </Button>
        <Button onClick={handleNext} disabled={!canNext}>
          {step === 3 ? t("impact.seeMyImpact") : t("common.next")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </Surface>
  );
};

export default ImpactForm;
