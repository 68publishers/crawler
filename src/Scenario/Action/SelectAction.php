<?php

namespace App\Scenario\Action;

use App\Browsershot\Browsershot;

final class SelectAction implements ActionInterface
{
    public function __construct(
        private readonly string $selector,
        private readonly string $value,
    ) {}

    public function apply(Browsershot $browsershot): void
    {
        $browsershot->addScenarioAction('select', [
            'selector' => $this->selector,
            'value' => $this->value,
        ]);
    }
}
