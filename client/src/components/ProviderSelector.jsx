// Displays a panel for selecting AI providers to use in task classification
const providerOptions = [
    {
        id: "openai",
        label: "OpenAI",
        description:
            "Structured task classification using OpenAI.",
    },
    {
        id: "gemini",
        label: "Gemini",
        description:
            "Google Gemini classification with retry handling.",
    },
    {
        id: "deepseek",
        label: "DeepSeek",
        description:
            "Cost-efficient structured classification.",
    },
];

// Displays a panel for selecting AI providers to use in task classification
function ProviderSelector({
    selectedProviders,
    onChange,
    disabled,
}) {
    // Handles the change in provider selection, updating the selected providers list
    function handleProviderChange(providerId) {
        const isSelected =
            selectedProviders.includes(providerId);

        if (isSelected) {
            onChange(
                selectedProviders.filter(
                    (id) => id !== providerId
                )
            );

            return;
        }

        onChange([
            ...selectedProviders,
            providerId,
        ]);
    }

    return (
        <section className="panel provider-selector">
            <div className="provider-selector-heading">
                <div>
                    <p className="eyebrow">
                        AI Configuration
                    </p>

                    <h3>Select AI Providers</h3>

                    <p>
                        Choose which providers will analyze
                        tasks. Selecting fewer providers can
                        reduce response time and API costs.
                    </p>
                </div>

                <span className="provider-selection-count">
                    {selectedProviders.length} selected
                </span>
            </div>

            <div className="provider-options">
                {providerOptions.map((provider) => {
                    const isSelected =
                        selectedProviders.includes(
                            provider.id
                        );

                    return (
                        <label
                            className={
                                isSelected
                                    ? "provider-option provider-option-selected"
                                    : "provider-option"
                            }
                            key={provider.id}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={disabled}
                                onChange={() =>
                                    handleProviderChange(
                                        provider.id
                                    )
                                }
                            />

                            <span className="provider-option-content">
                                <strong>
                                    {provider.label}
                                </strong>

                                <small>
                                    {
                                        provider.description
                                    }
                                </small>
                            </span>
                        </label>
                    );
                })}
            </div>

            {selectedProviders.length === 0 && (
                <p className="provider-selection-error">
                    Select at least one AI provider before
                    starting an analysis.
                </p>
            )}
        </section>
    );
}

export default ProviderSelector;