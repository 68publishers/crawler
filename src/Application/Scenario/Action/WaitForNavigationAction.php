<?php

namespace App\Application\Scenario\Action;

use App\Application\Browsershot\Browsershot;

final class WaitForNavigationAction implements ActionInterface
{
    public function apply(Browsershot $browsershot): void
    {
        $browsershot->addScenarioAction('waitForNavigation', [
            'waitUntil' => 'networkidle2',
        ]);
    }
}
