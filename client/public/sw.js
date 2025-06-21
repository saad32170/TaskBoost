const CACHE_NAME = 'tasktree-v1';
const urlsToCache = [
  '/',
  '/scanner',
  '/planner',
  '/progress',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('TaskTree: Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('TaskTree: Failed to cache resources:', error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // If both cache and network fail, show offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('TaskTree: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline task completion
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-tasks') {
    console.log('TaskTree: Background sync triggered');
    event.waitUntil(syncTasks());
  }
});

// Push notification handler
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'TaskTree notification',
    icon: '/manifest-icon-192.png',
    badge: '/manifest-icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Tasks',
        icon: '/static/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/static/images/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('TaskTree', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/planner')
    );
  } else if (event.action === 'close') {
    // Notification closed
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function to sync tasks when back online
async function syncTasks() {
  try {
    // Get pending tasks from IndexedDB or localStorage
    const pendingTasks = await getPendingTasks();
    
    if (pendingTasks.length > 0) {
      // Sync each pending task
      for (const task of pendingTasks) {
        try {
          await fetch('/api/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
            credentials: 'include'
          });
          
          // Remove from pending tasks after successful sync
          await removePendingTask(task.id);
        } catch (error) {
          console.error('TaskTree: Failed to sync task:', error);
        }
      }
    }
  } catch (error) {
    console.error('TaskTree: Background sync failed:', error);
  }
}

// Helper function to get pending tasks (placeholder implementation)
async function getPendingTasks() {
  // In a real implementation, this would read from IndexedDB
  // For now, return empty array as we don't have offline storage implemented
  return [];
}

// Helper function to remove pending task (placeholder implementation)
async function removePendingTask(taskId) {
  // In a real implementation, this would remove from IndexedDB
  console.log('TaskTree: Would remove pending task:', taskId);
}

// Message handler for communication with main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('TaskTree: Service Worker loaded');
