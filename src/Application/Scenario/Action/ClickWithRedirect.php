<?php

namespace App\Application\Scenario\Action;

use App\Application\Browsershot\Browsershot;

final class ClickWithRedirect implements ActionInterface
{
    public function __construct(
        private readonly string $linkOrButtonSelector,
        private readonly int $delay = 0,
        private readonly bool $xpath = false,
    ) {}

    public function apply(Browsershot $browsershot): void
    {
        $browsershot->addScenarioAction('clickWithRedirect', [
            'selector' => $this->linkOrButtonSelector,
            'delay' => $this->delay,
            'waitUntil' => 'networkidle0',
            'xpath' => $this->xpath,
        ]);
    }
}
