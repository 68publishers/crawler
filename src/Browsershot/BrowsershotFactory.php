<?php

namespace App\Browsershot;

final class BrowsershotFactory implements BrowsershotFactoryInterface
{
    public function __construct(
        private readonly string $nodeBinary,
        private readonly string $npmBinary,
        private readonly string $chromePath,
        private readonly string $binPath = __DIR__ . '/../../bin/browser.js',
    ) {}

    public function create(): Browsershot
    {
        $browsershot = new Browsershot();

        $browsershot->setNodeBinary($this->nodeBinary);
        $browsershot->setNpmBinary($this->npmBinary);
        $browsershot->setChromePath($this->chromePath);
        $browsershot->setBinPath($this->binPath);

        return $browsershot;
    }
}
