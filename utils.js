// Utility functions for error handling and loading states

// Show loading spinner
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('loading');
        element.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    }
}

// Hide loading spinner
function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('loading');
    }
}

// Show error message
function showError(elementId, error) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${error.message || 'An error occurred. Please try again.'}</p>
                <button onclick="retryOperation('${elementId}')">Retry</button>
            </div>
        `;
    }
}

// Retry failed operation
async function retryOperation(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        try {
            showLoading(elementId);
            switch(elementId) {
                case 'counsellorsList':
                    await loadCounsellorData();
                    break;
                case 'wellnessHub':
                    await loadWellnessHub();
                    break;
                // Add more cases as needed
                default:
                    await initializeApp();
            }
        } catch (error) {
            showError(elementId, error);
        } finally {
            hideLoading(elementId);
        }
    }
}

// Safe fetch with timeout and retry
async function safeFetch(url, options = {}, timeout = 5000, retries = 3) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { 
            ...options, 
            signal: controller.signal 
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        if (retries > 0) {
            return safeFetch(url, options, timeout, retries - 1);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

// Error boundary HOF
function withErrorBoundary(asyncFn, elementId) {
    return async (...args) => {
        try {
            showLoading(elementId);
            await asyncFn(...args);
        } catch (error) {
            console.error(`Error in ${asyncFn.name}:`, error);
            showError(elementId, error);
        } finally {
            hideLoading(elementId);
        }
    };
}
