function EvaluationPage() {
    return (
        <main className="page-container">
            <header className="page-heading">
                <p className="eyebrow">
                    Dataset Testing
                </p>

                <h2>Model Evaluation</h2>

                <p>
                    Evaluate provider accuracy, precision, recall,
                    F1 score, response time, and confusion matrices
                    using the university query dataset.
                </p>
            </header>

            <section className="panel placeholder-panel">
                <h3>Evaluation not started</h3>

                <p>
                    Dataset evaluation controls and metrics will
                    be added during Sprint 6.
                </p>
            </section>
        </main>
    );
}

export default EvaluationPage;