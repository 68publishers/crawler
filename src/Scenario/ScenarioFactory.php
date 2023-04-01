<?php

namespace App\Scenario;

use InvalidArgumentException;
use App\Scenario\Action\ActionInterface;
use App\Browsershot\BrowsershotFactoryInterface;

final class ScenarioFactory implements ScenarioFactoryInterface
{
    /** @var array<string, array{0: string, 1: ScenarioOptions, 2: array<ActionInterface>}> */
    private array $scenarios = [];

    public function __construct(
        private readonly BrowsershotFactoryInterface $browsershotFactory,
    ) {}

    /**
     * @param array<ActionInterface> $actions
     */
    public function registerScenario(
        string $name,
        string $url,
        ScenarioOptions|array $options = [],
        array $actions = [],
    ): void {
        $this->scenarios[$name] = [
            $url,
            $options instanceof ScenarioOptions ? $options : ScenarioOptions::fromArray($options),
            $actions,
        ];
    }

    public function create(string $name): ScenarioInterface
    {
        if (!isset($this->scenarios[$name])) {
            throw new InvalidArgumentException(sprintf(
                'Scenario with name "%s" is not defined.',
                $name
            ));
        }

        [$url, $options, $actions] = $this->scenarios[$name];

        return new Scenario(
            name: $name,
            url: $url,
            actions: $actions,
            options: $options,
            browsershotFactory: $this->browsershotFactory,
        );
    }
}
