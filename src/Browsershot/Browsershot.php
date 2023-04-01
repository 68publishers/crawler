<?php

namespace App\Browsershot;

use Spatie\Browsershot\Browsershot as SpatieBrowsershot;

final class Browsershot extends SpatieBrowsershot
{
    public function addScenarioAction(string $type, array $options): void
    {
        $scenario = $this->additionalOptions['scenario'] ?? [];
        $scenario[] = ['type' => $type, 'options' => $options];

        $this->setOption('scenario', $scenario);
    }
}
