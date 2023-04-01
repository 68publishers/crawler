<?php

namespace App\Scenario\Action;

use App\Browsershot\Browsershot;

final class WaitForNavigationAction implements ActionInterface
{
    public function apply(Browsershot $browsershot): void
    {
        $browsershot->addScenarioAction('waitForNavigation', [
            'waitUntil' => 'networkidle2',
        ]);
    }
}
