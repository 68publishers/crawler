<?php

namespace App\Scenario\Action;

use App\Browsershot\Browsershot;

final class ScreenshotAction implements ActionInterface
{
    public function __construct(
        private readonly string $name,
    ) {}

    public function apply(Browsershot $browsershot): void
    {
        $browsershot->addScenarioAction('screenshot', [
            'name' => $this->name,
        ]);
    }
}
