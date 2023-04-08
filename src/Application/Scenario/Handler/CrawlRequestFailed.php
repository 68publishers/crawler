<?php

namespace App\Application\Scenario\Handler;

use Exception;
use App\Application\Scenario\CrawlObserver;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException;
use Spatie\Crawler\Handlers\CrawlRequestFailed as SpatieCrawlRequestFailed;

final class CrawlRequestFailed extends SpatieCrawlRequestFailed
{
    public function __invoke(Exception $exception, $index): void
    {
        if ($exception instanceof ConnectException) {
            $exception = new RequestException($exception->getMessage(), $exception->getRequest());
        }

        $crawlUrl = $this->crawler->getCrawlQueue()->getUrlById($index);

        if ($exception instanceof RequestException) {
            $this->crawler->getCrawlObservers()->crawlFailed($crawlUrl, $exception);
        } else {
            foreach ($this->crawler->getCrawlObservers() as $crawlObserver) {
                if ($crawlObserver instanceof CrawlObserver) {
                    $crawlObserver->crawlFailedAnyException($crawlUrl->url, $exception, $crawlUrl->foundOnUrl);
                }
            }
        }

        usleep($this->crawler->getDelayBetweenRequests());
    }
}
