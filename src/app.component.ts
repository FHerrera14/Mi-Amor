
import { Component, ChangeDetectionStrategy, signal, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from './gemini.service';

type AnimationStage = 'initial' | 'fireworks' | 'final';

interface Firework {
  id: number;
  text: string;
  x: number;
  y: number;
  particles: Particle[];
}
interface Particle {
  style: { [key: string]: string };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  providers: [GeminiService]
})
export class AppComponent implements OnDestroy {
  private geminiService = inject(GeminiService);

  stage = signal<AnimationStage>('initial');
  isLoading = signal(false);
  finalTextOpacity = signal(0);
  
  private animationTimeouts: any[] = [];
  private loveMessages: string[] = [];
  
  displayedFireworks = signal<Firework[]>([]);
  stars = signal<any[]>(Array.from({ length: 50 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`,
      animationDelay: `${Math.random() * 4}s`
  })));

  ngOnDestroy(): void {
    this.animationTimeouts.forEach(clearTimeout);
  }

  async startAnimation(): Promise<void> {
    if (this.isLoading()) return;
    this.isLoading.set(true);

    try {
      this.loveMessages = await this.geminiService.generateLoveMessages();
    } catch(e) {
      // Fallback is handled in the service
      this.loveMessages = [
        'Cada día a tu lado es mi favorito.',
        'Sin importar lo que pase,',
        'quiero ser quien esté contigo siempre.'
      ];
    } finally {
      this.isLoading.set(false);
      this.stage.set('fireworks');
      this.runFireworkSequence();
    }
  }

  private runFireworkSequence(): void {
    this.loveMessages.forEach((message, index) => {
      const timeout = setTimeout(() => {
        this.displayedFireworks.update(current => [...current, this.createFirework(message)]);
      }, index * 4000); // Stagger the fireworks
      this.animationTimeouts.push(timeout);
    });

    // Schedule the final screen transition
    const finalTimeout = setTimeout(() => {
      this.stage.set('final');
      setTimeout(() => this.finalTextOpacity.set(1), 500);
    }, this.loveMessages.length * 4000 + 1000);
    this.animationTimeouts.push(finalTimeout);
  }

  private createFirework(text: string): Firework {
    const numParticles = 80;
    const particles: Particle[] = [];
    const color = `hsl(${Math.random() * 360}, 100%, 75%)`;

    for (let i = 0; i < numParticles; i++) {
        const angle = (i / numParticles) * Math.PI * 2;
        // Create a heart shape
        const t = angle;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        const radius = 180 + Math.random() * 20;

        particles.push({
            style: {
                'background-color': color,
                '--transform-end': `translate(${x * radius/15}px, ${y * radius/15}px)`,
                'animation-delay': `${Math.random() * 0.2}s`
            }
        });
    }

    return {
      id: Date.now(),
      text,
      x: 25 + Math.random() * 50, // position between 25% and 75%
      y: 25 + Math.random() * 30, // position between 25% and 55%
      particles
    };
  }
}
