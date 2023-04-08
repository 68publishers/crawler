<?php

namespace App\Application\Scenario;

final class Viewport
{
    public function __construct(
        public readonly int $width,
        public readonly int $height,
    ) {}
}
