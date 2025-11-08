'use client';

import { useState, useEffect, useRef } from 'react';
import { useUserProfile } from '@/lib/store/user-profile';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { conversationMemory } from '@/lib/utils/conversation-memory';

interface VoiceFirstInterfaceProps {
  onStart?: () => void;
  onStop?: () => void;
}

export function VoiceFirstInterface({ onStart, onStop }: VoiceFirstInterfaceProps) {
  const { profileId } = useUserProfile();
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isTravelMode, setIsTravelMode] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [travelModeActive, setTravelModeActive] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const travelModeRef = useRef(false);
  const lastAnalysisRef = useRef<string>('');
  const analysisCountRef = useRef(0);
  const isSpeakingRef = useRef(false);
  const currentAnalysisRef = useRef<Promise<string> | null>(null);
  const shouldStopRef = useRef(false); // Global flag to prevent new speech/analysis
  const speechQueueRef = useRef<SpeechSynthesisUtterance[]>([]); // Track all utterances
  const pendingTimeoutsRef = useRef<NodeJS.Timeout[]>([]); // Track all timeouts
  const shouldAutoContinueRef = useRef(false); // Flag to auto-continue after speaking all 5 items
  const itemsToSpeakRef = useRef<string[]>([]); // Track items to speak
  const currentItemIndexRef = useRef(0); // Track current item being spoken
  const stateRef = useRef<'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'PAUSED'>('IDLE'); // Clear state machine
  const lastUserInputTimeRef = useRef(0); // Track when user last spoke
  const autoContinueTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Track auto-continue timeout
  const isUserSpeakingRef = useRef(false); // Track if user is currently speaking

  // Auto-start for blind users - initialize everything automatically
  useEffect(() => {
    if (profileId === 'visual' && !isInitialized) {
      setIsInitialized(true);
      // Auto-start camera and listening for blind users
      initializeForBlindUser();
    }
  }, [profileId, isInitialized]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true; // Enable interim results for faster response
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = async (event: SpeechRecognitionEvent) => {
        // Mark that user is speaking
        isUserSpeakingRef.current = true;
        lastUserInputTimeRef.current = Date.now();
        
        // Cancel any pending auto-continue
        if (autoContinueTimeoutRef.current) {
          clearTimeout(autoContinueTimeoutRef.current);
          autoContinueTimeoutRef.current = null;
        }
        
        // If assistant is speaking, stop it immediately when user speaks
        if (isSpeakingRef.current || stateRef.current === 'SPEAKING') {
          stopSpeaking();
          stateRef.current = 'PAUSED';
        }
        
        // Get the latest result
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript.trim() + ' ';
          }
        }
        
        if (transcript.trim()) {
          console.log('Voice command:', transcript);
          // Update state
          stateRef.current = 'PROCESSING';
          
          // Pause recognition while processing command
          try {
            recognitionInstance.stop();
          } catch (e) {
            // Ignore errors
          }
          
          await handleVoiceCommand(transcript.trim());
          
          // Mark user finished speaking
          isUserSpeakingRef.current = false;
          
          // Resume recognition after processing completes (but wait for speech to finish)
          // This will be handled in the speak function's onend callback
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
      // Restart listening if no speech detected
      if (isListening || autoStart) {
        setTimeout(() => {
          if (recognitionInstance && (isListening || autoStart) && recognitionInstance.state !== 'running') {
            try {
              recognitionInstance.start();
            } catch (e: any) {
              // If already started, ignore the error
              if (e.name !== 'InvalidStateError' && !e.message?.includes('already started')) {
                console.error('Error restarting recognition:', e);
              }
            }
          }
        }, 1000);
      }
        }
      };

      recognitionInstance.onend = () => {
        // Restart if still listening or auto-start is enabled
        if ((isListening || autoStart) && recognitionInstance && recognitionInstance.state !== 'running') {
          setTimeout(() => {
            if ((isListening || autoStart) && recognitionInstance.state !== 'running') {
              try {
                recognitionInstance.start();
              } catch (e: any) {
                // If already started, ignore the error
                if (e.name !== 'InvalidStateError' && !e.message?.includes('already started')) {
                  console.error('Error restarting recognition in onend:', e);
                }
              }
            }
          }, 100);
        }
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isListening, autoStart]);

  // Auto-initialize for blind users
  const initializeForBlindUser = async () => {
    speak('Initializing voice assistant. I will be your eyes. Please wait while I start the camera and microphone.', 'high');
    
    try {
      const cameraReady = await startCamera();
      if (!cameraReady) {
        speak('Camera failed to start. Please check permissions.', 'high');
        return;
      }

      // Wait for video to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAutoStart(true);
      setIsListening(true);
      
      // Start recognition only if not already running
      if (recognition && recognition.state !== 'running') {
        try {
          recognition.start();
        } catch (e: any) {
          // If already started, ignore the error
          if (e.name !== 'InvalidStateError' && !e.message?.includes('already started')) {
            console.error('Error starting recognition:', e);
          }
        }
      }
      
      speak('I am ready. I am listening continuously. Just speak naturally. Say "what do you see" to describe your surroundings, or "I am walking" to start navigation assistance.', 'high');
      
      // Do an initial analysis
      setTimeout(async () => {
        const description = await analyzeScene(
          'List the TOP 3-5 most important things in this scene for a blind person. Format as a numbered list. Be very brief and actionable. Keep each item to 5-10 words max.',
          false,
          undefined,
          true // Use quick mode
        );
      }, 3000);
    } catch (error) {
      console.error('Error initializing:', error);
      speak('Failed to initialize. Please check camera and microphone permissions.', 'high');
    }
  };

  // Start camera for continuous vision
  const startCamera = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        return new Promise((resolve) => {
          const video = videoRef.current!;
          
          const handleCanPlay = () => {
            video.play()
              .then(() => {
                setVideoReady(true);
                resolve(true);
              })
              .catch((err) => {
                console.error('Error playing video:', err);
                resolve(false);
              });
          };

          const handleLoadedMetadata = () => {
            if (video.readyState >= 2) {
              handleCanPlay();
            }
          };

          video.addEventListener('canplay', handleCanPlay, { once: true });
          video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
          
          if (video.readyState >= 2) {
            handleCanPlay();
          }
        });
      }
      return true;
    } catch (error) {
      console.error('Error starting camera:', error);
      speak('Camera access denied. Please enable camera permissions.');
      return false;
    }
  };

  // Capture image from camera
  const captureImage = (): string | null => {
    if (!videoRef.current || !canvasRef.current) {
      console.log('Video or canvas ref not available');
      return null;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Check if video is ready
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Video not ready:', {
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
      return null;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      console.log('Canvas context not available');
      return null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image captured, size:', imageData.length);
    return imageData;
  };

  // Stop all speech immediately - production-level aggressive stopping
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      
      // Set stop flag immediately
      shouldStopRef.current = true;
      isSpeakingRef.current = false;
      
      // Cancel all speech immediately (synchronous)
      synth.cancel();
      
      // Resume speech recognition after stopping (user might want to speak)
      if (recognition && (isListening || autoStart) && recognition.state !== 'running') {
        setTimeout(() => {
          if (!isSpeakingRef.current && !shouldStopRef.current && (isListening || autoStart) && recognition.state !== 'running') {
            try {
              recognition.start();
            } catch (e: any) {
              // If already started, ignore the error
              if (e.name !== 'InvalidStateError' && !e.message?.includes('already started')) {
                console.error('Error starting recognition after stop:', e);
              }
            }
          }
        }, 200);
      }
      
      // Clear all pending utterances from queue
      speechQueueRef.current.forEach((utterance) => {
        try {
          synth.cancel();
        } catch (e) {
          // Ignore errors
        }
      });
      speechQueueRef.current = [];
      
      // Force multiple cancellations to ensure it stops
      // Use requestAnimationFrame for immediate execution
      requestAnimationFrame(() => {
        synth.cancel();
        isSpeakingRef.current = false;
      });
      
      // Additional cancellation after microtask
      Promise.resolve().then(() => {
        synth.cancel();
        isSpeakingRef.current = false;
      });
      
      // Final cancellation after a brief delay (but don't wait for it)
      const timeout = setTimeout(() => {
        synth.cancel();
        isSpeakingRef.current = false;
      }, 10);
      pendingTimeoutsRef.current.push(timeout);
    }
  };

  // Parse numbered list and extract all items
  const parseNumberedList = (text: string): string[] => {
    // Try to extract numbered items (1., 2., 3., etc.)
    const items: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      // Match patterns like "1. item", "1) item", "1 - item", etc.
      const match = line.match(/^\s*(\d+)\.?\s*[)\-]?\s*(.+)$/);
      if (match) {
        const itemText = match[2].trim();
        if (itemText) {
          items.push(itemText);
        }
      }
    }
    
    // If we found items, return them; otherwise return the original text as a single item
    if (items.length > 0) {
      return items;
    }
    
    // Fallback: try to split by common separators
    const fallbackItems = text.split(/[\.;]\s+/).filter(item => item.trim().length > 0);
    if (fallbackItems.length > 0) {
      return fallbackItems;
    }
    
    // Last resort: return as single item
    return [text];
  };

  // Speak text using Web Speech API - with stop flag check
  // If text contains numbered list, speak all items sequentially
  const speak = (text: string, priority: 'high' | 'normal' = 'normal', autoContinue: boolean = false) => {
    // CRITICAL: Check stop flag first - don't speak if stopped
    if (shouldStopRef.current) {
      console.log('Stop flag active, not speaking');
      return;
    }
    
    // Parse numbered list
    const items = parseNumberedList(text);
    console.log('Parsed items:', items.length, items);
    
    // If we have multiple items (numbered list), speak them sequentially
    if (items.length > 1) {
      shouldAutoContinueRef.current = autoContinue;
      itemsToSpeakRef.current = items;
      currentItemIndexRef.current = 0;
      speakNextItem(priority);
      return;
    }
    
    // Single item or non-numbered text - speak normally
    speakSingleItem(text, priority, autoContinue);
  };
  
  // Speak next item in the list sequentially
  const speakNextItem = (priority: 'high' | 'normal' = 'normal') => {
    if (shouldStopRef.current || isUserSpeakingRef.current) {
      console.log('Stop flag active or user speaking, stopping sequential speaking');
      return;
    }
    
    const items = itemsToSpeakRef.current;
    const currentIndex = currentItemIndexRef.current;
    
    if (currentIndex >= items.length) {
      // All items spoken - auto-continue will be handled in utterance.onend
      console.log('All items spoken');
      stateRef.current = 'IDLE';
      return;
    }
    
    const item = items[currentIndex];
    console.log(`Speaking item ${currentIndex + 1} of ${items.length}:`, item);
    
    // Speak this item
    speakSingleItem(item, priority, false, () => {
      // After this item is spoken, move to next (only if user hasn't interrupted)
      if (!shouldStopRef.current && !isUserSpeakingRef.current) {
        currentItemIndexRef.current++;
        setTimeout(() => {
          if (!shouldStopRef.current && !isUserSpeakingRef.current) {
            speakNextItem(priority);
          }
        }, 600); // Slightly longer delay between items for clarity
      }
    });
  };
  
  // Speak a single item
  const speakSingleItem = (text: string, priority: 'high' | 'normal' = 'normal', autoContinue: boolean = false, onComplete?: () => void) => {
    
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not available');
      if (onComplete) onComplete();
      return;
    }

    try {
      const synth = window.speechSynthesis;
      
      // Check if speech synthesis is available and not in an error state
      if (!synth) {
        console.warn('Speech synthesis not available');
        return;
      }

      // Always cancel ongoing speech when new speech starts (interruptible)
      if (priority === 'high' || isSpeakingRef.current) {
        synth.cancel();
        isSpeakingRef.current = false;
        
        // Use requestAnimationFrame for immediate execution
        requestAnimationFrame(() => {
          // Check stop flag again before speaking
          if (shouldStopRef.current) {
            return;
          }
          
          try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Track utterance in queue
            speechQueueRef.current.push(utterance);
            
            utterance.onerror = (event: any) => {
              // Remove from queue
              speechQueueRef.current = speechQueueRef.current.filter(u => u !== utterance);
              isSpeakingRef.current = false;
              
              // Silently handle all errors
              try {
                const errorType = event?.error;
                if (errorType && 
                    typeof errorType === 'string' && 
                    errorType.length > 0 &&
                    errorType !== 'interrupted' && 
                    errorType !== 'canceled' &&
                    errorType !== 'network' &&
                    errorType !== 'synthesis-failed' &&
                    errorType !== 'synthesis-unavailable') {
                  // Critical error occurred but we don't log it
                }
              } catch (e) {
                // Silently ignore any errors in error handling
              }
            };
            
            utterance.onend = () => {
              // Remove from queue
              speechQueueRef.current = speechQueueRef.current.filter(u => u !== utterance);
              isSpeakingRef.current = false;
              
              // Call onComplete callback if provided
              if (onComplete) {
                onComplete();
              }
              
              // Check if this was the last item in a sequence
              const items = itemsToSpeakRef.current;
              const currentIndex = currentItemIndexRef.current;
              const isLastItem = currentIndex >= items.length;
              
              // If auto-continue is enabled and this is the last item, schedule next analysis
              // But only if user hasn't spoken recently (2 seconds grace period)
              if (isLastItem && shouldAutoContinueRef.current && !shouldStopRef.current && travelModeRef.current) {
                const timeSinceUserInput = Date.now() - lastUserInputTimeRef.current;
                const gracePeriod = 2000; // 2 seconds
                
                if (timeSinceUserInput > gracePeriod && !isUserSpeakingRef.current) {
                  // Clear any existing timeout
                  if (autoContinueTimeoutRef.current) {
                    clearTimeout(autoContinueTimeoutRef.current);
                  }
                  
                  // Schedule auto-continue after a delay
                  autoContinueTimeoutRef.current = setTimeout(() => {
                    if (!shouldStopRef.current && travelModeRef.current && !isUserSpeakingRef.current) {
                      const timeSinceLastInput = Date.now() - lastUserInputTimeRef.current;
                      // Only continue if user hasn't spoken in the last 2 seconds
                      if (timeSinceLastInput > gracePeriod) {
                        console.log('Auto-continuing to next analysis after all items spoken');
                        stateRef.current = 'PROCESSING';
                        analyzeScene(
                          'List EXACTLY 5 most important things for navigation as a blind person is walking. Format as a numbered list: "1. [item]. 2. [item]. 3. [item]. 4. [item]. 5. [item]." Each item must be 5-10 words max. Focus on: 1) Immediate path ahead - clear/blocked/obstacle with distance, 2) People nearby - position and distance, 3) Steps/curbs/elevation changes - height and distance, 4) Doors/openings - open/closed and distance, 5) Hazards to avoid - location and distance. Do NOT say "top 5" or "here are 5 things" - just list the 5 numbered items directly.',
                          false,
                          'Navigation assistance - continuous guidance',
                          true
                        );
                      }
                    }
                    autoContinueTimeoutRef.current = null;
                  }, 1500); // Wait 1.5 seconds after last item is spoken
                }
              }
              
              // Resume speech recognition after speaking completes
              // But only if we're not in a sequence of items (wait for all items to finish)
              if (isLastItem && (isListening || autoStart) && recognition && !shouldStopRef.current && recognition.state !== 'running') {
                stateRef.current = 'LISTENING';
                setTimeout(() => {
                  if (!isSpeakingRef.current && !shouldStopRef.current && (isListening || autoStart) && !isUserSpeakingRef.current && recognition.state !== 'running') {
                    try {
                      recognition.start();
                    } catch (e: any) {
                      // If already started, ignore the error
                      if (e.name !== 'InvalidStateError' && !e.message?.includes('already started')) {
                        // Try again after a delay
                        setTimeout(() => {
                          if (recognition && recognition.state !== 'running' && !shouldStopRef.current && !isUserSpeakingRef.current) {
                            try {
                              recognition.start();
                            } catch (e2: any) {
                              // If already started, ignore
                              if (e2.name !== 'InvalidStateError' && !e2.message?.includes('already started')) {
                                console.error('Error restarting recognition:', e2);
                              }
                            }
                          }
                        }, 1000); // Longer delay to avoid conflicts
                      }
                    }
                  }
                }, 1200); // Longer delay to ensure speech completes and avoid picking up echo
              }
            };
            
            utterance.onstart = () => {
              // Check stop flag when speech actually starts
              if (shouldStopRef.current) {
                synth.cancel();
                isSpeakingRef.current = false;
                stateRef.current = 'PAUSED';
                return;
              }
              isSpeakingRef.current = true;
              stateRef.current = 'SPEAKING';
              
              // Ensure recognition is stopped while speaking
              if (recognition && recognition.state === 'running') {
                try {
                  recognition.stop();
                } catch (e) {
                  // Ignore errors
                }
              }
            };
            
            // Final check before speaking
            if (shouldStopRef.current) {
              return;
            }
            
            synth.speak(utterance);
            console.log('Speaking:', text.substring(0, 50) + '...');
          } catch (err) {
            isSpeakingRef.current = false;
            console.warn('Error creating speech utterance:', err);
          }
        });
      } else {
        // Normal priority - check if already speaking
        if (synth.speaking || isSpeakingRef.current) {
          // Cancel and speak new message (interruptible)
          synth.cancel();
          isSpeakingRef.current = false;
          setTimeout(() => {
            try {
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.rate = 1.0;
              utterance.pitch = 1.0;
              utterance.volume = 1.0;
              
              utterance.onerror = (event: any) => {
                // Completely silent error handler - suppress all errors
                isSpeakingRef.current = false;
                
                // Silently handle all errors - don't log anything
                try {
                  const errorType = event?.error;
                  if (errorType && 
                      typeof errorType === 'string' && 
                      errorType.length > 0 &&
                      errorType !== 'interrupted' && 
                      errorType !== 'canceled' &&
                      errorType !== 'network' &&
                      errorType !== 'synthesis-failed' &&
                      errorType !== 'synthesis-unavailable') {
                    // Critical error occurred but we don't log it
                  }
                } catch (e) {
                  // Silently ignore any errors in error handling
                }
              };
              
              utterance.onend = () => {
                isSpeakingRef.current = false;
                
                // Resume speech recognition after speaking completes
                if ((isListening || autoStart) && recognition && !shouldStopRef.current) {
                  setTimeout(() => {
                    if (!isSpeakingRef.current && !shouldStopRef.current && (isListening || autoStart)) {
                      try {
                        if (recognition && recognition.state !== 'running') {
                          recognition.start();
                        }
                      } catch (e) {
                        // Ignore
                      }
                    }
                  }, 800);
                }
              };
              
              utterance.onstart = () => {
                isSpeakingRef.current = true;
              };
              
              synth.speak(utterance);
              console.log('Speaking:', text.substring(0, 50) + '...');
            } catch (err) {
              isSpeakingRef.current = false;
              console.warn('Error creating speech utterance:', err);
            }
          }, 50);
          return;
        }
        
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          
          utterance.onerror = (event: any) => {
            // Completely silent error handler - suppress all errors
            isSpeakingRef.current = false;
            
            // Silently handle all errors - don't log anything
            try {
              const errorType = event?.error;
              if (errorType && 
                  typeof errorType === 'string' && 
                  errorType.length > 0 &&
                  errorType !== 'interrupted' && 
                  errorType !== 'canceled' &&
                  errorType !== 'network' &&
                  errorType !== 'synthesis-failed' &&
                  errorType !== 'synthesis-unavailable') {
                // Critical error occurred but we don't log it
              }
            } catch (e) {
              // Silently ignore any errors in error handling
            }
          };
          
          utterance.onend = () => {
            isSpeakingRef.current = false;
          };
          
          utterance.onstart = () => {
            isSpeakingRef.current = true;
          };
          
          synth.speak(utterance);
          console.log('Speaking:', text.substring(0, 50) + '...');
        } catch (err) {
          isSpeakingRef.current = false;
          console.warn('Error creating speech utterance:', err);
        }
      }
    } catch (error) {
      isSpeakingRef.current = false;
      console.warn('Error in speak function:', error);
    }
  };

  // Analyze scene with AI - enhanced with conversation memory
  const analyzeScene = async (
    context?: string, 
    silent: boolean = false, 
    question?: string,
    quickMode: boolean = false // New parameter for quick updates
  ): Promise<string> => {
    // CRITICAL: Check stop flag first - don't analyze if stopped
    if (shouldStopRef.current) {
      console.log('Stop flag active, canceling analysis');
      return 'Analysis canceled.';
    }
    
    // Cancel any ongoing analysis
    if (currentAnalysisRef.current) {
      console.log('Canceling previous analysis');
    }
    
    // Wait a bit for video to be ready (but check stop flag during wait)
    if (!videoReady) {
      console.log('Waiting for video to be ready...');
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, 500);
        pendingTimeoutsRef.current.push(timeout);
        // Check stop flag during wait
        if (shouldStopRef.current) {
          clearTimeout(timeout);
          resolve(undefined);
        }
      });
      
      // Check stop flag again after wait
      if (shouldStopRef.current) {
        return 'Analysis canceled.';
      }
    }

    const image = captureImage();
    if (!image) {
      const errorMsg = 'Unable to capture image. Please ensure camera is enabled and ready.';
      if (!silent) speak(errorMsg, 'high');
      return errorMsg;
    }

    // Create a promise for this analysis
    let analysisPromise: Promise<string>;
    const promiseRef = { current: null as Promise<string> | null };
    
    analysisPromise = (async () => {
      try {
        setIsProcessing(true);
        console.log('Analyzing scene with context:', context?.substring(0, 50));
        
        // Get conversation context for follow-up questions
        const conversationContext = conversationMemory.getContext();
        const isFollowUp = question ? conversationMemory.isFollowUpQuestion(question) : false;
        
        // Build enhanced context with conversation history
        // Quick mode: limit to top 3-5 most important items
        let enhancedContext: string;
        
        if (quickMode) {
          // Quick mode: EXACTLY 5 items, concise and actionable
          enhancedContext = context || 'List EXACTLY 5 most important things in this scene for a blind person walking. Format as a numbered list: "1. [item]. 2. [item]. 3. [item]. 4. [item]. 5. [item]." Each item must be 5-10 words max. Focus on: 1) Immediate obstacles or hazards, 2) People nearby and their position, 3) Path ahead (clear/blocked), 4) Important objects or text, 5) Distance or spatial relationships. Do NOT say "top 5" or "here are 5 things" - just list the 5 numbered items directly. Example: "1. Clear path ahead for 10 feet. 2. Person on left, 5 feet away. 3. Door ahead, appears open. 4. Sign on right says Exit. 5. Step down 6 inches, 8 feet ahead."';
        } else {
          // Detailed mode: full description
          enhancedContext = context || 'Describe this scene in detail for a blind person. Include obstacles, people, objects, text, and spatial relationships. Be specific about locations (left, right, center, distance).';
        }
        
        if (isFollowUp && conversationContext) {
          enhancedContext = `${enhancedContext}\n\nPrevious context: ${conversationContext}\n\nThis is a follow-up question. Use the previous context to provide a more detailed or specific answer.`;
        }
        
        // Add specific query enhancements
        if (question) {
          const lowerQuestion = question.toLowerCase();
          
          // Specific queries for better responses
          if (lowerQuestion.includes('where is') || lowerQuestion.includes('where are')) {
            enhancedContext = `${enhancedContext}\n\nFocus on location and spatial relationships. Be very specific about positions (left, right, center, ahead, behind, distance in feet or meters).`;
          } else if (lowerQuestion.includes('how many')) {
            enhancedContext = `${enhancedContext}\n\nCount and provide exact numbers. Be specific.`;
          } else if (lowerQuestion.includes('is there') || lowerQuestion.includes('are there')) {
            enhancedContext = `${enhancedContext}\n\nProvide a clear yes or no answer first, then describe what you see.`;
          } else if (lowerQuestion.includes('is the') || lowerQuestion.includes('are the')) {
            enhancedContext = `${enhancedContext}\n\nProvide a clear yes or no answer first, then describe the state or condition.`;
          } else if (lowerQuestion.includes('empty') || lowerQuestion.includes('available')) {
            enhancedContext = `${enhancedContext}\n\nFocus on availability and empty spaces. Describe what is available or empty.`;
          } else if (lowerQuestion.includes('open') || lowerQuestion.includes('closed')) {
            enhancedContext = `${enhancedContext}\n\nFocus on the state of doors, windows, or openings. Describe if they are open or closed.`;
          } else if (lowerQuestion.includes('queue') || lowerQuestion.includes('line')) {
            enhancedContext = `${enhancedContext}\n\nFocus on people waiting, lines, or queues. Describe the length and position.`;
          }
        }
        
        const response = await callAI(
          {
            type: 'vision',
            data: {
              image,
              context: enhancedContext,
              scenario: 'general',
            },
          },
          {
            apiKey,
            provider: aiProvider,
          }
        );
        
        const description = response.result;
        console.log('Scene analysis result:', description.substring(0, 100));
        setLastResponse(description);
        
        // Store in conversation memory
        if (question) {
          conversationMemory.addExchange(question, description, image);
        } else {
          conversationMemory.setSceneContext(description);
        }
        
        // Check if this analysis was canceled (new one started or stop flag)
        if (currentAnalysisRef.current !== promiseRef.current || shouldStopRef.current) {
          console.log('Analysis was canceled, not speaking');
          return description;
        }
        
        if (!silent && !shouldStopRef.current && !isUserSpeakingRef.current) {
          // Stop any ongoing speech before speaking new description
          stopSpeaking();
          // Reset stop flag to allow new speech
          shouldStopRef.current = false;
          
          // Cancel any pending auto-continue (we're starting a new one)
          if (autoContinueTimeoutRef.current) {
            clearTimeout(autoContinueTimeoutRef.current);
            autoContinueTimeoutRef.current = null;
          }
          
          // Pause speech recognition while speaking (prevents interference)
          if (recognition && recognition.state === 'running') {
            try {
              recognition.stop();
            } catch (e) {
              // Ignore errors
            }
          }
          
          // Small delay to ensure stop flag is reset and recognition is paused
          setTimeout(() => {
            // Check stop flag and user speaking status again before speaking
            if (!shouldStopRef.current && !isUserSpeakingRef.current && description) {
              console.log('Auto-speaking description:', description.substring(0, 50) + '...');
              // Enable auto-continue for travel mode
              const shouldAutoContinue = travelModeRef.current && quickMode;
              speak(description, 'high', shouldAutoContinue);
            }
          }, 200); // Slightly longer delay for better coordination
        }
        
        return description;
      } catch (error) {
        console.error('Error analyzing scene:', error);
        const errorMsg = 'Failed to analyze scene. Please try again.';
        if (!silent && currentAnalysisRef.current === promiseRef.current) {
          stopSpeaking();
          speak(errorMsg, 'high');
        }
        return errorMsg;
      } finally {
        if (currentAnalysisRef.current === promiseRef.current) {
          setIsProcessing(false);
          currentAnalysisRef.current = null;
        }
      }
    })();
    
    promiseRef.current = analysisPromise;
    currentAnalysisRef.current = analysisPromise;
    return analysisPromise;
  };

  // Handle voice commands
  const handleVoiceCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    
    // Immediately stop any ongoing speech when a new command is received
    stopSpeaking();
    
    // Reset stop flag for new command
    shouldStopRef.current = false;
    
    // Cancel any ongoing analysis
    currentAnalysisRef.current = null;
    setIsProcessing(false);
    
    // Stop commands - check for stop first (most important)
    // Check for any variation of stop command
    if (lowerCommand.includes('stop') || 
        lowerCommand === 'stop' ||
        lowerCommand.includes('hey stop') ||
        lowerCommand.includes('please stop') ||
        lowerCommand.includes('stop talking') ||
        lowerCommand.includes('stop speaking') ||
        lowerCommand.includes('stop listening') ||
        lowerCommand.includes('stop assistant') ||
        lowerCommand.includes('cancel') ||
        lowerCommand.includes('enough') ||
        lowerCommand.includes('that\'s enough') ||
        lowerCommand.includes('shut up') ||
        lowerCommand.includes('quiet') ||
        lowerCommand.includes('be quiet') ||
        lowerCommand.includes('silence')) {
      
      // Stop everything immediately
      stopListening();
      
      // Don't speak "Stopped" - just stop everything silently
      // The user wants it to stop, not to hear confirmation
      return;
    }

    // Travel/walking mode commands - more natural phrases
    if (lowerCommand.includes('walking') || 
        lowerCommand.includes('i am walking') || 
        lowerCommand.includes('i\'m walking') ||
        lowerCommand.includes('start walking') ||
        lowerCommand.includes('travel') || 
        lowerCommand.includes('navigate') || 
        lowerCommand.includes('walk') ||
        lowerCommand.includes('guide me') ||
        lowerCommand.includes('help me walk')) {
      
      if (!videoReady) {
        speak('Please wait for camera to be ready, then try again.');
        return;
      }
      
      if (!travelModeRef.current) {
        setIsTravelMode(true);
        travelModeRef.current = true;
        setTravelModeActive(true);
        
        speak('Navigation assistance activated. I will continuously describe your path and surroundings as you walk.', 'high');
        
        // Start continuous analysis
        startContinuousAnalysis();
        
        // Do immediate first analysis
        setTimeout(async () => {
          const description = await analyzeScene(
            'List EXACTLY 5 most important things for navigation. Format as a numbered list: "1. [item]. 2. [item]. 3. [item]. 4. [item]. 5. [item]." Each item must be 5-10 words max. Focus on: 1) Path ahead - clear/blocked with distance, 2) Obstacles/steps/curbs - location and distance, 3) People nearby - position and distance, 4) Doors/openings - state and distance, 5) Hazards - location and distance. Do NOT say "top 5" or "here are 5 things" - just list the 5 numbered items directly.',
            false,
            'Navigation assistance - initial scan',
            true // Use quick mode
          );
        }, 1000);
      }
      return;
    }

    if (lowerCommand.includes('stop walking') || 
        lowerCommand.includes('stop travel') || 
        lowerCommand.includes('exit travel') ||
        lowerCommand.includes('i stopped')) {
      if (travelModeRef.current) {
        setIsTravelMode(false);
        travelModeRef.current = false;
        setTravelModeActive(false);
        stopContinuousAnalysis();
        speak('Navigation assistance stopped. I am still listening for your commands.', 'high');
      }
      return;
    }

        // Scene analysis commands - more natural phrases with follow-up support
        // Use quick mode by default for "what do you see" to get top 3-5 items
        if (lowerCommand.includes('what do you see') || 
            lowerCommand.includes('what can you see') ||
            lowerCommand.includes('what\'s ahead') ||
            lowerCommand.includes('what is ahead') ||
            lowerCommand.includes('what\'s in front') ||
            lowerCommand.includes('what is in front') ||
            lowerCommand.includes('tell me what you see') ||
            (lowerCommand.includes('what') && lowerCommand.includes('see'))) {
          const description = await analyzeScene(
            'List EXACTLY 5 most important things in this scene for a blind person. Format as a numbered list: "1. [item]. 2. [item]. 3. [item]. 4. [item]. 5. [item]." Each item must be 5-10 words max. Focus on: 1) Immediate obstacles or hazards, 2) People nearby and their position, 3) Path ahead (clear/blocked), 4) Important objects or text, 5) Distance or spatial relationships. Do NOT say "top 5" or "here are 5 things" - just list the 5 numbered items directly.',
            false,
            command,
            true // Use quick mode for concise updates
          );
          return;
        }
        
        // Detailed describe command (if user explicitly asks for details)
        if (lowerCommand.includes('describe in detail') || 
            lowerCommand.includes('describe everything') ||
            lowerCommand.includes('full description')) {
          const description = await analyzeScene(
            'Describe this scene in detail for a blind person. Include what is directly ahead, obstacles, people, objects, text, and spatial relationships. Be specific about locations (left, right, center, distance).',
            false,
            command,
            false // Use detailed mode
          );
          return;
        }
    
    // Follow-up questions - specific queries
    if (lowerCommand.includes('where is') || 
        lowerCommand.includes('where are') ||
        lowerCommand.includes('where did') ||
        lowerCommand.includes('where can')) {
      const description = await analyzeScene(
        'Answer the location question. Be very specific about positions (left, right, center, ahead, behind, distance). Keep response to 1-2 sentences max.',
        false,
        command,
        true // Use quick mode
      );
      return;
    }
    
    if (lowerCommand.includes('how many')) {
      const description = await analyzeScene(
        'Count and provide exact numbers. Be specific about what you are counting. Keep response to 1-2 sentences max.',
        false,
        command,
        true // Use quick mode
      );
      return;
    }
    
    if (lowerCommand.includes('is there') || 
        lowerCommand.includes('are there') ||
        lowerCommand.includes('is the') ||
        lowerCommand.includes('are the')) {
      const description = await analyzeScene(
        'Provide a clear yes or no answer first, then describe what you see. Keep response to 1-2 sentences max.',
        false,
        command,
        true // Use quick mode
      );
      return;
    }
    
    if (lowerCommand.includes('empty') || 
        lowerCommand.includes('available') ||
        lowerCommand.includes('free')) {
      const description = await analyzeScene(
        'Focus on availability and empty spaces. Describe what is available or empty. Keep response to 1-2 sentences max.',
        false,
        command,
        true // Use quick mode
      );
      return;
    }
    
    if (lowerCommand.includes('open') || 
        lowerCommand.includes('closed')) {
      const description = await analyzeScene(
        'Focus on the state of doors, windows, or openings. Describe if they are open or closed. Keep response to 1-2 sentences max.',
        false,
        command,
        true // Use quick mode
      );
      return;
    }
    
    if (lowerCommand.includes('queue') || 
        lowerCommand.includes('line') ||
        lowerCommand.includes('waiting')) {
      const description = await analyzeScene(
        'Focus on people waiting, lines, or queues. Describe the length and position. Keep response to 1-2 sentences max.',
        false,
        command,
        true // Use quick mode
      );
      return;
    }

    // Obstacle detection - natural phrases
    if (lowerCommand.includes('obstacle') || 
        lowerCommand.includes('hurdle') || 
        lowerCommand.includes('danger') ||
        lowerCommand.includes('anything in my way') ||
        lowerCommand.includes('anything blocking') ||
        lowerCommand.includes('is it safe')) {
      const description = await analyzeScene(
        'List EXACTLY 5 obstacles, hazards, or dangers in this scene. Format as a numbered list: "1. [item]. 2. [item]. 3. [item]. 4. [item]. 5. [item]." Each item must be 5-10 words max. For each item, describe location and how to avoid. If the path is clear, say "1. Path is clear" and list 4 other observations. Do NOT say "top 5" or "here are 5 things" - just list the 5 numbered items directly.',
        false,
        command,
        true // Use quick mode
      );
      return;
    }
    
    // Direction/guidance queries - enhanced with micro-navigation
    if (lowerCommand.includes('which way') || 
        lowerCommand.includes('where should i go') ||
        lowerCommand.includes('how do i get') ||
        lowerCommand.includes('turn') ||
        lowerCommand.includes('left') ||
        lowerCommand.includes('right') ||
        lowerCommand.includes('straight')) {
      const description = await analyzeScene(
        'List EXACTLY 5 navigation instructions. Format as a numbered list: "1. [item]. 2. [item]. 3. [item]. 4. [item]. 5. [item]." Each item must be 5-10 words max. Focus on: 1) Next turn - direction and distance, 2) Doors/openings - state and distance, 3) Stairs/steps - direction and distance, 4) Landmarks - location and distance, 5) Distance to next action. Do NOT say "top 5" or "here are 5 things" - just list the 5 numbered items directly.',
        false,
        command,
        true // Use quick mode
      );
      return;
    }
    
    // Person detection - enhanced with distance estimation
    if (lowerCommand.includes('anyone') || 
        lowerCommand.includes('any people') ||
        lowerCommand.includes('people nearby') ||
        lowerCommand.includes('someone') ||
        lowerCommand.includes('who is') ||
        lowerCommand.includes('who are')) {
      const description = await analyzeScene(
        'List EXACTLY 5 people in this scene. Format as a numbered list: "1. [item]. 2. [item]. 3. [item]. 4. [item]. 5. [item]." Each item must be 5-10 words max. For each person: location, distance, and position. If no people visible, say "1. No people visible" and list 4 other observations. Do NOT say "top 5" or "here are 5 things" - just list the 5 numbered items directly.',
        false,
        command,
        true // Use quick mode
      );
      return;
    }

    // Text reading - enhanced with quality feedback
    if (lowerCommand.includes('read') || 
        lowerCommand.includes('read text') ||
        lowerCommand.includes('read this') ||
        lowerCommand.includes('what does this say') ||
        lowerCommand.includes('what text') ||
        (lowerCommand.includes('read') && (lowerCommand.includes('mail') || lowerCommand.includes('letter') || lowerCommand.includes('document') || lowerCommand.includes('sign') || lowerCommand.includes('menu')))) {
      
      // Provide guidance for camera positioning
      speak('Point your camera at the text. I will guide you to get the best position.', 'high');
      
      // Wait a moment for user to position camera
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const image = captureImage();
      if (!image) {
        speak('Unable to capture image. Please ensure camera is enabled and ready. Try moving closer or adjusting lighting.', 'high');
        return;
      }

      try {
        setIsProcessing(true);
        
        // Check image quality first (simplified check)
        speak('Analyzing image quality...', 'normal');
        
        const response = await callAI(
          {
            type: 'vision',
            data: {
              image,
              context: 'Extract all text from this image. Return only the text content, preserving line breaks and structure. Be fast and accurate. If text is unclear, mention it.',
            },
          },
          {
            apiKey,
            provider: aiProvider,
          }
        );
        
        const text = response.result;
        setLastResponse(text);
        
        if (text && text.trim().length > 0) {
          speak(`I found the following text: ${text}`, 'high');
        } else {
          speak('No text detected. Please move closer, ensure good lighting, and point camera directly at the text.', 'high');
        }
      } catch (error) {
        speak('Failed to read text. Please try again. Make sure the text is clear and well-lit.', 'high');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Barcode scanning commands
    if (lowerCommand.includes('scan barcode') || 
        lowerCommand.includes('read barcode') ||
        lowerCommand.includes('what product') ||
        lowerCommand.includes('what is this product')) {
      
      speak('Point your camera at the barcode. I will scan and identify the product.', 'high');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const image = captureImage();
      if (!image) {
        speak('Unable to capture image. Please ensure camera is enabled.', 'high');
        return;
      }

      try {
        setIsProcessing(true);
        
        // Use AI to detect barcode
        const barcodePrompt = 'Look for a barcode in this image. If you find one, extract the barcode number. Return ONLY the barcode number if found, or "NO_BARCODE" if no barcode is visible.';
        const barcodeResponse = await callAI(
          {
            type: 'vision',
            data: {
              image,
              context: barcodePrompt,
              scenario: 'object',
            },
          },
          {
            apiKey,
            provider: aiProvider,
          }
        );
        
        const barcodeResult = barcodeResponse.result;
        if (barcodeResult && !barcodeResult.includes('NO_BARCODE')) {
          const barcodeMatch = barcodeResult.match(/\b\d{8,}\b/);
          if (barcodeMatch) {
            const barcode = barcodeMatch[0];
            
            // Get product info
            const productPrompt = `This image contains a product with barcode ${barcode}. Identify the product name, brand, size, and category. Be concise.`;
            const productResponse = await callAI(
              {
                type: 'vision',
                data: {
                  image,
                  context: productPrompt,
                  scenario: 'object',
                },
              },
              {
                apiKey,
                provider: aiProvider,
              }
            );
            
            const productInfo = productResponse.result;
            speak(`Barcode: ${barcode}. ${productInfo}`, 'high');
            setLastResponse(`Barcode: ${barcode}\n${productInfo}`);
          } else {
            speak('Barcode detected but could not read the number. Please try again with better lighting.', 'high');
          }
        } else {
          speak('No barcode detected. Please ensure the barcode is clearly visible and well-lit.', 'high');
        }
      } catch (error) {
        speak('Failed to scan barcode. Please try again.', 'high');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Object finding commands
    if (lowerCommand.includes('find my') || 
        lowerCommand.includes('where is my') ||
        lowerCommand.includes('find the') ||
        lowerCommand.includes('where is the') ||
        lowerCommand.includes('locate')) {
      
      // Extract object name from command
      const objectMatch = lowerCommand.match(/(?:find my|where is my|find the|where is the|locate)\s+(.+)/);
      const objectName = objectMatch ? objectMatch[1].trim() : lowerCommand.replace(/(?:find my|where is my|find the|where is the|locate)\s*/i, '').trim();
      
      if (objectName) {
        speak(`Looking for ${objectName}. Point your camera around the area.`, 'high');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const image = captureImage();
        if (!image) {
          speak('Unable to capture image. Please ensure camera is enabled.', 'high');
          return;
        }

        try {
          setIsProcessing(true);
          
          const response = await callAI(
            {
              type: 'vision',
              data: {
                image,
                context: `Look for a ${objectName} in this image. If you find it, describe its exact location (left, right, center, ahead, behind, up, down) and approximate distance in feet or meters. Be very specific about the location. If the object is not visible, say "NOT_FOUND".`,
                scenario: 'object',
              },
            },
            {
              apiKey,
              provider: aiProvider,
            }
          );
          
          const result = response.result;
          if (result && !result.includes('NOT_FOUND')) {
            speak(`I found ${objectName}. ${result}`, 'high');
            setLastResponse(`Found ${objectName}: ${result}`);
          } else {
            speak(`${objectName} not found in this view. Try moving the camera or adjusting the angle.`, 'high');
          }
        } catch (error) {
          speak('Failed to search for object. Please try again.', 'high');
        } finally {
          setIsProcessing(false);
        }
      }
      return;
    }

    // "Describe image" command - use short, concise description
    if (lowerCommand.includes('describe image') || 
        lowerCommand.includes('describe this image') ||
        lowerCommand.includes('describe the image') ||
        (lowerCommand.includes('describe') && lowerCommand.includes('image'))) {
      const description = await analyzeScene(
        'List EXACTLY 5 most important things in this image. Format as a numbered list: "1. [item]. 2. [item]. 3. [item]. 4. [item]. 5. [item]." Each item must be 5-10 words max. Focus on: 1) Main objects or people, 2) Their positions (left/right/center), 3) Important text if visible, 4) Any obstacles or notable features, 5) Distance or spatial relationships. Do NOT say "top 5" or "here are 5 things" - just list the 5 numbered items directly. Example: "1. Person on left, 5 feet away. 2. Door ahead, appears open. 3. Sign on right says Exit. 4. Step down 6 inches ahead. 5. Wall on right, 3 feet away."',
        false,
        command,
        true // Use quick mode for concise updates
      );
      return;
    }

    // General question - use AI to answer
    try {
      setIsProcessing(true);
      const image = captureImage();
      const response = await callAI(
        {
          type: image ? 'vision' : 'question',
          data: image
            ? {
                image,
                context: command,
                scenario: 'general',
              }
            : {
                prompt: command,
              },
        },
        {
          apiKey,
          provider: aiProvider,
        }
      );
      
      const answer = response.result;
      setLastResponse(answer);
      
      // Pause speech recognition while speaking
      if (recognition && recognition.state === 'running') {
        try {
          recognition.stop();
        } catch (e) {
          // Ignore errors
        }
      }
      
      // Reset stop flag and speak
      shouldStopRef.current = false;
      speak(answer, 'high');
    } catch (error) {
      speak('I could not process that request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Start continuous analysis for travel mode
  // NOTE: This is now a backup - auto-continue handles most updates
  const startContinuousAnalysis = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    console.log('Starting continuous analysis for travel mode (backup interval)');
    
    let analysisCount = 0;
    
    // Use longer interval since auto-continue handles most updates
    intervalRef.current = setInterval(async () => {
      // Use ref to check travel mode status and stop flag (avoids closure issues)
      if (!travelModeRef.current || shouldStopRef.current) {
        console.log('Travel mode inactive or stop flag active, stopping analysis');
        stopContinuousAnalysis();
        return;
      }

      if (!videoReady) {
        console.log('Video not ready, skipping analysis');
        return;
      }

      // Check if travel mode is still active and stop flag before analyzing
      if (!travelModeRef.current || shouldStopRef.current) {
        console.log('Travel mode stopped or stop flag active, skipping analysis');
        return;
      }
      
      // Don't run if user is speaking or assistant is speaking
      if (isUserSpeakingRef.current || isSpeakingRef.current || stateRef.current === 'SPEAKING') {
        console.log('User or assistant speaking, skipping interval analysis');
        return;
      }
      
      // Don't run if there's a pending auto-continue
      if (autoContinueTimeoutRef.current) {
        console.log('Auto-continue pending, skipping interval analysis');
        return;
      }
      
      analysisCount++;
      analysisCountRef.current = analysisCount;
      console.log(`Travel mode backup analysis #${analysisCount}`);

      try {
        // Check stop flag before starting analysis
        if (shouldStopRef.current || !travelModeRef.current || isUserSpeakingRef.current) {
          console.log('Stop flag active or user speaking, skipping analysis');
          return;
        }
        
        stateRef.current = 'PROCESSING';
        
        // Use quick mode for travel mode - EXACTLY 5 items, concise updates
        // Note: analyzeScene will automatically enable auto-continue for travel mode
        const description = await analyzeScene(
          'List EXACTLY 5 most important things for navigation as a blind person is walking. Format as a numbered list: "1. [item]. 2. [item]. 3. [item]. 4. [item]. 5. [item]." Each item must be 5-10 words max. Focus on: 1) Immediate path ahead - clear/blocked/obstacle with distance, 2) People nearby - position and distance, 3) Steps/curbs/elevation changes - height and distance, 4) Doors/openings - open/closed and distance, 5) Hazards to avoid - location and distance. Do NOT say "top 5" or "here are 5 things" - just list the 5 numbered items directly. Example: "1. Clear path ahead for 10 feet. 2. Person on left, 5 feet away. 3. Step down 6 inches, 8 feet ahead. 4. Door on right, appears closed. 5. Sign ahead says Stop."',
          false, // Always speak in travel mode
          'Navigation assistance - continuous guidance',
          true // Use quick mode for concise updates - this enables auto-continue
        );
        
        // Check if travel mode is still active and stop flag after analysis
        if (!travelModeRef.current || shouldStopRef.current) {
          console.log('Travel mode stopped or stop flag active during analysis');
          return;
        }
        
        // Check if this is a new/different description to avoid repetition
        if (description && 
            !description.includes('Unable to capture') && 
            !description.includes('Failed to analyze') &&
            description !== lastAnalysisRef.current) {
          lastAnalysisRef.current = description;
          console.log('Travel mode description:', description.substring(0, 100));
          // Description is already spoken in analyzeScene
        }
      } catch (error) {
        console.error('Error in continuous analysis:', error);
        stateRef.current = 'IDLE';
      }
    }, 15000); // Longer interval (15 seconds) since auto-continue handles most updates
    
    console.log('Continuous analysis interval started (backup mode)');
  };

  const stopContinuousAnalysis = () => {
    if (intervalRef.current) {
      console.log('Stopping continuous analysis');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Also clear travel mode ref
    travelModeRef.current = false;
    setIsTravelMode(false);
    setTravelModeActive(false);
  };

  // Start listening
  const startListening = async () => {
    // Reset stop flag when starting
    shouldStopRef.current = false;
    
    if (!recognition) {
      speak('Speech recognition is not available in your browser.');
      return;
    }

    try {
      if (!cameraStream) {
        speak('Starting camera and microphone. Please wait...');
        const cameraReady = await startCamera();
        
        if (!cameraReady) {
          speak('Camera failed to start. Please check permissions.');
          return;
        }

        // Wait a bit for video to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setIsListening(true);
      setAutoStart(true);
      
      // Start recognition only if not already running
      if (recognition && recognition.state !== 'running') {
        try {
          recognition.start();
        } catch (e: any) {
          // If already started, ignore the error
          if (e.name !== 'InvalidStateError' && !e.message?.includes('already started')) {
            console.error('Error starting recognition:', e);
          }
        }
      }
      
      speak('I am listening continuously. Just speak naturally. Say "what do you see" to describe your surroundings, or "I am walking" to start navigation assistance.', 'high');
      onStart?.();
    } catch (error) {
      console.error('Error starting recognition:', error);
      speak('Failed to start listening. Please check your microphone permissions.', 'high');
    }
  };

  // Stop listening - stops everything immediately (production-level)
  const stopListening = () => {
    console.log('Stopping everything immediately...');
    
    // Set global stop flag FIRST - prevents any new operations
    shouldStopRef.current = true;
    stateRef.current = 'PAUSED';
    
    // Stop all speech immediately (synchronous, no delays)
    stopSpeaking();
    
    // Cancel all ongoing analysis
    currentAnalysisRef.current = null;
    setIsProcessing(false);
    
    // Cancel auto-continue timeout
    if (autoContinueTimeoutRef.current) {
      clearTimeout(autoContinueTimeoutRef.current);
      autoContinueTimeoutRef.current = null;
    }
    
    // Stop continuous analysis
    stopContinuousAnalysis();
    
    // Stop travel mode
    travelModeRef.current = false;
    setIsTravelMode(false);
    setTravelModeActive(false);
    
    // Clear all pending timeouts
    pendingTimeoutsRef.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    pendingTimeoutsRef.current = [];
    
    // Reset speaking state
    isUserSpeakingRef.current = false;
    itemsToSpeakRef.current = [];
    currentItemIndexRef.current = 0;
    shouldAutoContinueRef.current = false;
    
    // Stop speech recognition
    if (recognition) {
      try {
        recognition.stop();
        recognition.abort(); // Also abort to ensure it stops
      } catch (e) {
        // Already stopped
      }
    }
    
    // Stop listening state
    setIsListening(false);
    setAutoStart(false);
    
    // Stop camera
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false; // Disable track
      });
      setCameraStream(null);
    }
    setVideoReady(false);
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Call onStop callback
    onStop?.();
    
    // Reset stop flag after a brief moment (allows for restart)
    setTimeout(() => {
      shouldStopRef.current = false;
      stateRef.current = 'IDLE';
    }, 100);
  };

  // Only show for visual impairment profile
  if (profileId !== 'visual') {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 lg:p-8">
      {/* Camera Preview (hidden but active) */}
      <div className="hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-h-[500px] object-cover"
          aria-hidden="true"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Main Interface */}
      <div className="w-full max-w-2xl space-y-6 sm:space-y-8 text-center">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Voice Assistant</h1>
          <p className="text-base sm:text-lg text-gray-700 px-4">
            I am your eyes. Ask me anything, and I will help you navigate and understand your surroundings.
          </p>
        </div>

        {/* Big Start Button - Only show if not auto-started */}
        {!isListening && !autoStart ? (
          <button
            onClick={startListening}
            className="h-32 w-32 sm:h-40 sm:w-40 lg:h-48 lg:w-48 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 min-h-[128px] min-w-[128px]"
            aria-label="Start voice assistant"
          >
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-4">
              <svg
                className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold">Start</span>
            </div>
          </button>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Status Indicator */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <div className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full ${(isListening || autoStart) ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-lg sm:text-xl font-semibold text-gray-900">
                {(isListening || autoStart) ? 'Always Listening...' : 'Stopped'}
              </span>
            </div>
            
            {/* Auto-start indicator */}
            {autoStart && (
              <div className="rounded-xl border-2 border-blue-500 bg-blue-50 p-3 sm:p-4 mx-4 sm:mx-0">
                <p className="text-base sm:text-lg font-semibold text-blue-900">
                  🎤 Always Listening Mode
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Just speak naturally. I will understand and help you.
                </p>
              </div>
            )}

            {/* Stop Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Stop button clicked - stopping everything');
                stopListening();
              }}
              className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white shadow-xl transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300 min-h-[96px] min-w-[96px]"
              aria-label="Stop voice assistant"
              type="button"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <svg
                  className="h-10 w-10 sm:h-12 sm:w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                </svg>
                <span className="text-base sm:text-lg lg:text-xl font-bold">Stop</span>
              </div>
            </button>

            {/* Travel Mode Indicator */}
            {travelModeActive && (
              <div className="rounded-xl border-2 border-green-500 bg-green-50 p-3 sm:p-4 mx-4 sm:mx-0">
                <p className="text-base sm:text-lg font-semibold text-green-900">
                  🚶 Travel Mode Active
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Continuously analyzing your surroundings every 8 seconds
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Camera: {videoReady ? '✓ Ready' : '⏳ Loading...'}
                </p>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="rounded-xl border border-blue-300 bg-blue-50 p-3 sm:p-4 mx-4 sm:mx-0">
                <p className="text-sm sm:text-base text-blue-900">Processing your request...</p>
              </div>
            )}

            {/* Last Response */}
            {lastResponse && !isProcessing && (
              <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 text-left shadow-sm mx-4 sm:mx-0">
                <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900">Last Response:</h3>
                <p className="text-sm sm:text-base text-gray-700 break-words">{lastResponse}</p>
                <div className="mt-4">
                  <TextToSpeech text={lastResponse} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voice Commands Help */}
        {(isListening || autoStart) && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 text-left mx-4 sm:mx-0">
            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-900">Natural Voice Commands:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• "What do you see?" - Describe your surroundings</li>
              <li>• "I am walking" or "I'm walking" - Start navigation assistance</li>
              <li>• "What's ahead?" - Describe what's in front of you</li>
              <li>• "Any obstacles?" or "Is it safe?" - Check for hazards</li>
              <li>• "Anyone nearby?" - Check for people</li>
              <li>• "Read text" - Read any text in view</li>
              <li>• "Which way should I go?" - Get navigation guidance</li>
              <li>• "Stop walking" - Stop navigation assistance</li>
            </ul>
            <p className="mt-4 text-xs text-gray-500 italic">
              Just speak naturally - I understand conversational language and will help you navigate and understand your surroundings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

