// Displays controls for configuring and running an evaluation of AI providers on a dataset
const evaluationProviderOptions = [
    {
        id: "openai",
        label: "OpenAI",
    },
    {
        id: "gemini",
        label: "Gemini",
    },
    {
        id: "deepseek",
        label: "DeepSeek",
    },
];

// Sets the sample size options for the evaluation controls
const sampleSizeOptions = [
    1,
    5,
    10,
];

// Displays controls for configuring and running an evaluation of AI providers on a dataset
function EvaluationControls({
    split,
    sampleSize,
    offset,
    selectedProviders,
    running,
    onSplitChange,
    onSampleSizeChange,
    onOffsetChange,
    onProvidersChange,
    onRun,
}) {
    // Toggles the selection of a provider in the evaluation controls
    function toggleProvider(providerId) {
        const alreadySelected =
            selectedProviders.includes(providerId);

        if (alreadySelected) {
            onProvidersChange(
                selectedProviders.filter(
                    (id) => id !== providerId
                )
            );

            return;
        }

        onProvidersChange([
            ...selectedProviders,
            providerId,
        ]);
    }

    // Handles the form submission for running the evaluation
    function handleSubmit(event) {
        event.preventDefault();
        onRun();
    }

    return (
        <section className="comparison-section">
            <div className="section-title">
                <div>
                    <p className="eyebrow">
                        Evaluation Configuration
                    </p>

                    <h3>Run Dataset Evaluation</h3>
                </div>
            </div>

            <form
                className="panel evaluation-controls"
                onSubmit={handleSubmit}
            >
                <div className="evaluation-control-grid">
                    <div className="evaluation-field">
                        <label htmlFor="evaluationSplit">
                            Dataset split
                        </label>

                        <select
                            id="evaluationSplit"
                            value={split}
                            disabled={running}
                            onChange={(event) =>
                                onSplitChange(
                                    event.target.value
                                )
                            }
                        >
                            <option value="test">
                                Test
                            </option>

                            <option value="train">
                                Training
                            </option>
                        </select>
                    </div>

                    <div className="evaluation-field">
                        <label htmlFor="evaluationSampleSize">
                            Sample size
                        </label>

                        <select
                            id="evaluationSampleSize"
                            value={sampleSize}
                            disabled={running}
                            onChange={(event) =>
                                onSampleSizeChange(
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                        >
                            {sampleSizeOptions.map(
                                (size) => (
                                    <option
                                        key={size}
                                        value={size}
                                    >
                                        {size} record
                                        {size === 1
                                            ? ""
                                            : "s"}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="evaluation-field">
                        <label htmlFor="evaluationOffset">
                            Starting offset
                        </label>

                        <input
                            id="evaluationOffset"
                            type="number"
                            min="0"
                            step="1"
                            value={offset}
                            disabled={running}
                            onChange={(event) =>
                                onOffsetChange(
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                        />
                    </div>
                </div>

                <fieldset
                    className="evaluation-provider-fieldset"
                    disabled={running}
                >
                    <legend>
                        AI providers
                    </legend>

                    <p>
                        Each selected provider is called once
                        for every dataset record.
                    </p>

                    <div className="evaluation-provider-options">
                        {evaluationProviderOptions.map(
                            (provider) => {
                                const selected =
                                    selectedProviders.includes(
                                        provider.id
                                    );

                                return (
                                    <label
                                        className={
                                            selected
                                                ? "evaluation-provider-option evaluation-provider-option-selected"
                                                : "evaluation-provider-option"
                                        }
                                        key={
                                            provider.id
                                        }
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                selected
                                            }
                                            onChange={() =>
                                                toggleProvider(
                                                    provider.id
                                                )
                                            }
                                        />

                                        <span>
                                            {
                                                provider.label
                                            }
                                        </span>
                                    </label>
                                );
                            }
                        )}
                    </div>
                </fieldset>

                <div className="evaluation-cost-note">
                    <strong>
                        Estimated provider calls:
                    </strong>{" "}
                    {sampleSize *
                        selectedProviders.length}
                </div>

                {selectedProviders.length === 0 && (
                    <p className="provider-selection-error">
                        Select at least one provider before
                        running an evaluation.
                    </p>
                )}

                <div className="evaluation-actions">
                    <button
                        type="submit"
                        disabled={
                            running ||
                            selectedProviders.length ===
                                0
                        }
                    >
                        {running
                            ? "Running Evaluation..."
                            : "Run Evaluation"}
                    </button>
                </div>
            </form>
        </section>
    );
}

export default EvaluationControls;