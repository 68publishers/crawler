<?php

namespace App\Scenario;

use JsonException;
use InvalidArgumentException;
use Psr\Log\LoggerInterface;
use App\Scenario\Result\Result;
use App\Scenario\Result\Cookie;
use Psr\Http\Message\UriInterface;
use App\Scenario\Result\VisitError;
use Psr\Http\Message\ResponseInterface;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\DomCrawler\Crawler as DomCrawler;
use Spatie\Crawler\CrawlObservers\CrawlObserver as SpatieCrawlObserver;
use Throwable;

final class CrawlObserver extends SpatieCrawlObserver
{
    public function __construct(
        private readonly string $scenarioName,
        private readonly LoggerInterface $logger,
        private Result $result = new Result(),
    ) {}

    public function getResult(): Result
    {
        return $this->result;
    }

    public function willCrawl(UriInterface $url): void
    {
        $this->logger->info(sprintf(
            '[%s] Starting crawl URL %s',
            $this->scenarioName,
            $url,
        ));
    }

    public function crawled(UriInterface $url, ResponseInterface $response, ?UriInterface $foundOnUrl = NULL): void
    {
        $domCrawler = new DomCrawler($response->getBody()->getContents(), $foundOnUrl);

        try {
            $cookiesContent = $domCrawler->filterXPath('//cmp-crawler-cookies')->text();
            $cookiesData = (array) json_decode($cookiesContent, true, 512, JSON_THROW_ON_ERROR);
        } catch (InvalidArgumentException|JsonException $e) {
            $this->crawlFailedAnyException($url, $e, $foundOnUrl);

            return;
        }

        assert(isset($cookiesData['url'], $cookiesData['cookies']));

        $url = $cookiesData['url'];
        $cookies = $cookiesData['cookies'];
        $this->result = $this->result->withVisitedUrl($url);

        $this->logger->info(sprintf(
            '[%s] Found %d cookie%s on URL %s',
            $this->scenarioName,
            count($cookies),
            1 === count($cookies) ? '' : 's',
            $url,
        ));

        foreach ($cookies as $cookie) {
            assert(isset($cookie['name'], $cookie['domain']));

            $this->result = $this->result->withCookie(new Cookie(
                name: $cookie['name'],
                domain: $cookie['domain'],
                foundOnUrl: $url,
                httpOnly: $cookie['httpOnly'] ?? false,
                secure: $cookie['secure'] ?? false,
                session: $cookie['session'] ?? false,
                sameSite: $cookie['sameSite'] ?? null,
            ));
        }
    }

    public function crawlFailed(UriInterface $url, RequestException $requestException, ?UriInterface $foundOnUrl = NULL): void
    {
        $this->crawlFailedAnyException($url, $requestException, $foundOnUrl);
    }

    public function crawlFailedAnyException(UriInterface $url, Throwable $requestException, ?UriInterface $foundOnUrl = NULL): void
    {
        $this->result = $this->result
            ->withVisitedUrl($url)
            ->withVisitError(new VisitError(
                (string) $url,
                $requestException,
            ));

        $this->logger->error(sprintf(
            '[%s] Failed to crawl URL %s',
            $this->scenarioName,
            $url,
        ));
    }
}
