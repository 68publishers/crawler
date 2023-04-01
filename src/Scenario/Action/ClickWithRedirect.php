<?php

namespace App\Scenario\Action;

use App\Browsershot\Browsershot;

final class ClickWithRedirect implements ActionInterface
{
    public function __construct(
        private readonly string $linkOrButtonSelector,
        private readonly int    $delay = 0,
    ) {}

    public function apply(Browsershot $browsershot): void
    {
        $browsershot->addScenarioAction('clickWithRedirect', [
            'selector' => $this->linkOrButtonSelector,
            'delay' => $this->delay,
            'waitUntil' => 'networkidle0',
        ]);
    }
}
