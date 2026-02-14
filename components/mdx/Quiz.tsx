"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Check, X, RotateCcw, Trophy, HelpCircle } from "lucide-react";

interface QuizOption {
  text: string;
  correct?: boolean;
  explanation?: string;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
  hint?: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  title?: string;
  showScore?: boolean;
  allowRetry?: boolean;
  className?: string;
}

export default function Quiz({
  questions,
  title = "Quiz",
  showScore = true,
  allowRetry = true,
  className,
}: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const question = questions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQuestion];
  const hasAnswered = selectedAnswer !== null;

  const correctAnswers = selectedAnswers.reduce((count: number, answer, index) => {
    if (answer === null) return count;
    return questions[index].options[answer]?.correct ? count + 1 : count;
  }, 0);

  const selectAnswer = useCallback(
    (optionIndex: number) => {
      if (hasAnswered) return;

      setSelectedAnswers((prev) => {
        const newAnswers = [...prev];
        newAnswers[currentQuestion] = optionIndex;
        return newAnswers;
      });
      setShowHint(false);
    },
    [currentQuestion, hasAnswered]
  );

  const nextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setShowHint(false);
    } else {
      setShowResults(true);
    }
  }, [currentQuestion, questions.length]);

  const prevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setShowHint(false);
    }
  }, [currentQuestion]);

  const reset = useCallback(() => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(questions.length).fill(null));
    setShowResults(false);
    setShowHint(false);
  }, [questions.length]);

  // Results view
  if (showResults) {
    const percentage = Math.round((correctAnswers / questions.length) * 100);

    return (
      <div
        className={cn(
          "my-6 p-6 rounded-xl",
          "border border-border/50",
          "bg-card/30",
          className
        )}
      >
        <div className="text-center">
          <Trophy
            className={cn(
              "w-16 h-16 mx-auto mb-4",
              percentage >= 80
                ? "text-yellow-500"
                : percentage >= 50
                ? "text-slate-400"
                : "text-slate-600"
            )}
          />

          <h3 className="text-2xl font-bold mb-2">{title} Complete!</h3>

          {showScore && (
            <div className="mb-6">
              <p className="text-4xl font-bold text-primary mb-1">{percentage}%</p>
              <p className="text-muted-foreground">
                {correctAnswers} of {questions.length} correct
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mb-6">
            {percentage >= 80 && (
              <span className="text-green-500 font-medium">🎉 Excellent!</span>
            )}
            {percentage >= 50 && percentage < 80 && (
              <span className="text-amber-500 font-medium">👍 Good job!</span>
            )}
            {percentage < 50 && (
              <span className="text-muted-foreground font-medium">
                📚 Keep learning!
              </span>
            )}
          </div>

          {allowRetry && (
            <button
              onClick={reset}
              className={cn(
                "inline-flex items-center gap-2",
                "px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors"
              )}
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "my-6 rounded-xl overflow-hidden",
        "border border-border/50",
        "bg-card/30",
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "px-4 py-3",
          "bg-muted/50 border-b border-border/50",
          "flex items-center justify-between"
        )}
      >
        <h4 className="font-semibold">{title}</h4>
        <span className="text-sm text-muted-foreground">
          {currentQuestion + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{
            width: `${((currentQuestion + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question */}
      <div className="p-6">
        <p className="text-lg font-medium mb-6">{question.question}</p>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = option.correct;
            const showCorrectness = hasAnswered;

            return (
              <button
                key={index}
                onClick={() => selectAnswer(index)}
                disabled={hasAnswered}
                className={cn(
                  "w-full p-4 rounded-lg text-left",
                  "border-2 transition-all duration-200",
                  !hasAnswered && "hover:border-primary/50 hover:bg-muted/50",
                  !showCorrectness && isSelected && "border-primary bg-primary/10",
                  !showCorrectness && !isSelected && "border-border/50",
                  showCorrectness && isCorrect && "border-green-500 bg-green-500/10",
                  showCorrectness &&
                    !isCorrect &&
                    isSelected &&
                    "border-red-500 bg-red-500/10",
                  showCorrectness && !isCorrect && !isSelected && "border-border/30 opacity-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{option.text}</span>
                  {showCorrectness && (
                    <>
                      {isCorrect && <Check className="w-5 h-5 text-green-500" />}
                      {!isCorrect && isSelected && (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                    </>
                  )}
                </div>

                {/* Explanation */}
                {showCorrectness && isSelected && option.explanation && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {option.explanation}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Hint */}
        {question.hint && !hasAnswered && (
          <div className="mt-4">
            {showHint ? (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                💡 {question.hint}
              </p>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className={cn(
                  "flex items-center gap-1.5",
                  "text-sm text-muted-foreground",
                  "hover:text-foreground transition-colors"
                )}
              >
                <HelpCircle className="w-4 h-4" />
                Show hint
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div
        className={cn(
          "px-6 py-4",
          "bg-muted/30 border-t border-border/50",
          "flex items-center justify-between"
        )}
      >
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className={cn(
            "px-4 py-2 rounded-lg",
            "text-sm font-medium",
            "hover:bg-muted transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          Previous
        </button>

        <button
          onClick={nextQuestion}
          disabled={!hasAnswered}
          className={cn(
            "px-4 py-2 rounded-lg",
            "text-sm font-medium",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
