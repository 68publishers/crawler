<?php

namespace App\Scenario\Handler;

use App\Scenario\CrawlObserver;
use Psr\Http\Message\ResponseInterface;
use Throwable;
use Spatie\Crawler\Handlers\CrawlRequestFulfilled as SpatieCrawlRequestFulfilled;

final class CrawlRequestFulfilled extends SpatieCrawlRequestFulfilled
{
    public function __invoke(ResponseInterface $response, $index): void
    {
        try {
            parent::__invoke($response, $index);
        } catch (Throwable $e) {
            $crawlUrl = $this->crawler->getCrawlQueue()->getUrlById($index);

            foreach ($this->crawler->getCrawlObservers() as $crawlObserver) {
                if ($crawlObserver instanceof CrawlObserver) {
                    $crawlObserver->crawlFailedAnyException($crawlUrl->url, $e, $crawlUrl->foundOnUrl);
                }
            }
        }
    }
}
