<?php

namespace App\Application\Scenario\Action;

use App\Application\Browsershot\Browsershot;

final class KeyboardPressAction implements ActionInterface
{
    public function __construct(
        private readonly string $key,
    ) {}

    public function apply(Browsershot $browsershot): void
    {
        $browsershot->addScenarioAction('keyboardPress', [
            'key' => $this->key,
        ]);
    }
}
