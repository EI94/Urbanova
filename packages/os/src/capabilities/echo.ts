// Echo Capability - Example for Urbanova OS
import { z } from 'zod';
import { Capability, CapabilityContext } from '@urbanova/types';

// Schema argomenti
const zEchoArgs = z.object({
  text: z.string().min(1).max(1000),
  repeat: z.number().min(1).max(10).optional().default(1),
});

// Echo capability
export const echoCapability: Capability = {
  spec: {
    name: 'echo.say',
    description: 'Ripete il testo specificato',
    zArgs: zEchoArgs,
    requiredRole: 'pm',
    confirm: false,
    dryRun: false,
  },

  handler: async (ctx: CapabilityContext, args: z.infer<typeof zEchoArgs>): Promise<string> => {
    const { text, repeat } = args;

    ctx.logger.info(`[Echo] Esecuzione echo.say con testo: "${text}", ripetizioni: ${repeat}`);

    // Simula un piccolo delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Ripeti il testo
    const result = Array(repeat).fill(text).join(' ');

    ctx.logger.info(`[Echo] Risultato: "${result}"`);

    return result;
  },
};

// Export types
export type EchoArgs = z.infer<typeof zEchoArgs>;
