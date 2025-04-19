
export class RealtimeChat {
  private ws: WebSocket | null = null;

  constructor(private onMessage: (message: any) => void) {}

  async init() {
    try {
      // Get the session URL from our edge function
      const { data, error } = await supabase.functions.invoke('get-realtime-session', {
        body: { model: "gpt-4o-realtime-preview-2024-12-17" }
      });

      if (error) throw error;

      // Connect to OpenAI's realtime API using the session URL
      this.ws = new WebSocket(data.url);

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.onMessage(message);

        // If we receive the session.created event, send our session configuration
        if (message.type === 'session.created') {
          this.sendSessionConfig();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      // Set up audio recording when the connection is established
      this.ws.onopen = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              sampleRate: 24000,
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });

          const audioContext = new AudioContext({ sampleRate: 24000 });
          const source = audioContext.createMediaStreamSource(stream);
          const processor = audioContext.createScriptProcessor(4096, 1, 1);

          processor.onaudioprocess = (e) => {
            if (this.ws?.readyState === WebSocket.OPEN) {
              const inputData = e.inputBuffer.getChannelData(0);
              this.sendAudioChunk(inputData);
            }
          };

          source.connect(processor);
          processor.connect(audioContext.destination);
        } catch (error) {
          console.error('Error setting up audio:', error);
          throw error;
        }
      };

    } catch (error) {
      console.error('Error initializing chat:', error);
      throw error;
    }
  }

  private sendSessionConfig() {
    if (!this.ws) return;

    const config = {
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        instructions: "You are a helpful and encouraging tutor for primary school mathematics. Explain concepts in simple terms suitable for children. Use positive reinforcement and be patient. Your knowledge cutoff is 2023-10.",
        voice: "alloy",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 1000
        }
      }
    };

    this.ws.send(JSON.stringify(config));
  }

  private sendAudioChunk(audioData: Float32Array) {
    if (!this.ws) return;

    // Convert audio data to base64
    const base64Audio = this.encodeAudioData(audioData);
    
    // Send the audio chunk
    this.ws.send(JSON.stringify({
      type: 'input_audio_buffer.append',
      audio: base64Audio
    }));
  }

  private encodeAudioData(float32Array: Float32Array): string {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
