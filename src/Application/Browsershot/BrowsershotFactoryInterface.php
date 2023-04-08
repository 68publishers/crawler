<?php

namespace App\Application\Browsershot;

interface BrowsershotFactoryInterface
{
    public function create(): Browsershot;
}
