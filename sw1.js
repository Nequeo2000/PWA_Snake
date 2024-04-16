// service-worker.js

const putInCache = async (request, response) => {
    const cache = await caches.open("v1");
    await cache.put(request, response);
};

const fetchFirst = async ({ request, fallbackUrl }) => {
    try {
        const responseFromNetwork = await fetch(request);
        
        if (responseFromNetwork.status == "200") {
            putInCache(request, responseFromNetwork.clone());
            return responseFromNetwork;
        } else {
            throw new Error("No connection");
        }
    } catch (error) {
        // get from cache
        const responseFromCache = await caches.match(request);
        if (responseFromCache) {
            return responseFromCache;
        }
        // When even the fallback response is not available,
        // there is nothing we can do, but we must always
        // return a Response object.
        return new Response("Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
        });
    }
};

self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetchFirst({
            request: event.request,
        }),
    );
});

self.addEventListener("install", (event) => {
    console.log("installing");
});