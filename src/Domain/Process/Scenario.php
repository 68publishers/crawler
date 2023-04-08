<?php

namespace App\Domain\Process;

use App\Domain\Process\ValueObject\Url;
use App\Domain\Process\ValueObject\Actions;
use App\Domain\Process\ValueObject\ScenarioId;
use App\Domain\Process\ValueObject\ScenarioName;
use App\Domain\Process\ValueObject\ScenarioResult;

final class Scenario
{
    private ?ScenarioResult $result = null;

    public function __construct(
        private readonly Process $process,
        private readonly ScenarioId $scenarioId,
        private readonly ScenarioName $name,
        private readonly Url $url,
        private readonly Actions $actions,
    ) {}

    public function setResult(ScenarioResult $result): void
    {
        $this->result = $result;
    }

    public function getProcess(): Process
    {
        return $this->process;
    }

    public function getScenarioId(): ScenarioId
    {
        return $this->scenarioId;
    }

    public function getName(): ScenarioName
    {
        return $this->name;
    }

    public function getUrl(): Url
    {
        return $this->url;
    }

    public function getActions(): Actions
    {
        return $this->actions;
    }

    public function getResult(): ?ScenarioResult
    {
        return $this->result;
    }
}
