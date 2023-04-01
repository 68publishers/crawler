<?php

declare(strict_types=1);

namespace App;

use ArrayIterator;
use IteratorAggregate;
use Nette\Bootstrap\Configurator;
use SixtyEightPublishers\Environment\Debug\EnvDetector;
use SixtyEightPublishers\Environment\Bootstrap\EnvBootstrap;
use SixtyEightPublishers\Environment\Debug\SimpleCookieDetector;
use SixtyEightPublishers\Environment\Debug\DebugModeDetectorInterface;

final class Bootstrap
{
    public static function boot(): Configurator
    {
        $configurator = new Configurator();

        EnvBootstrap::bootNetteConfigurator($configurator, self::createDetectorsIterator());

        $configurator->enableTracy(__DIR__ . '/../var/log');
        $configurator->setTempDirectory(__DIR__ . '/../var');
        $configurator->addConfig(__DIR__ . '/../config/config.neon');

        return $configurator;
    }

    /**
     * @return iterable<int, DebugModeDetectorInterface>
     */
    private static function createDetectorsIterator(): iterable
    {
        yield new EnvDetector();
    }
}
