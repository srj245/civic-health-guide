import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { ImpactProfile } from "@/pages/Impact";

const AGE_RANGES = ["18–26", "27–44", "45–64", "65+"];
const INSURANCE_TYPES = ["Employer", "Marketplace (ACA)", "Medicare", "Medicaid", "Uninsured", "Other"];
const CONCERNS = [
  "Prescription drug costs",
  "Mental health services",
  "Maternal & reproductive care",
  "Chronic conditions",
  "Preventive care",
  "Dental & vision",
  "Veterans health",
  "Rural access to care",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

interface Props {
  onSubmit: (profile: ImpactProfile) => void;
}

const ImpactForm = ({ onSubmit }: Props) => {
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
      title: "What's your age range?",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {AGE_RANGES.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={ageRange === a}
              onClick={() => setAgeRange(a)}
              className={`p-4 rounded-lg border text-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                ageRange === a
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/40 text-foreground"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "What type of insurance do you have?",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {INSURANCE_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={insuranceType === t}
              onClick={() => setInsuranceType(t)}
              className={`p-4 rounded-lg border text-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                insuranceType === t
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/40 text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "What health topics concern you most?",
      content: (
        <div className="flex flex-wrap gap-2">
          {CONCERNS.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={concerns.includes(c)}
              onClick={() => toggleConcern(c)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                concerns.includes(c)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/40 text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
          <p className="w-full text-xs text-muted-foreground mt-1">Select all that apply</p>
        </div>
      ),
    },
    {
      title: "What state do you live in?",
      content: (
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {US_STATES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={state === s}
              onClick={() => setState(s)}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                state === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/40 text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Card className="border-border bg-card shadow-none">
      <CardContent className="p-6 md:p-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step + 1} aria-label="Form progress">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded transition-colors ${
                i <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        <Badge variant="secondary" className="mb-3">Step {step + 1} of {steps.length}</Badge>
        <h2 className="text-xl font-medium tracking-tight text-foreground mb-6">{steps[step].title}</h2>
        {steps[step].content}

        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={handleNext} disabled={!canNext}>
            {step === 3 ? "See My Impact" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactForm;
