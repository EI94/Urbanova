import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = globalThis.__prisma || new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });

    if (process.env.NODE_ENV === 'development') {
      globalThis.__prisma = this.prisma;
    }
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getClient(): PrismaClient {
    return this.prisma;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  public async transaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  public async seed(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');
      
      // Creazione utente admin di default
      const adminUser = await this.prisma.user.upsert({
        where: { email: 'admin@urbanova.ai' },
        update: {},
        create: {
          email: 'admin@urbanova.ai',
          displayName: 'Admin Urbanova',
          firstName: 'Admin',
          lastName: 'Urbanova',
          role: 'ADMIN',
          status: 'ACTIVE',
          profile: {
            create: {
              company: 'Urbanova AI',
              position: 'System Administrator',
              bio: 'Amministratore di sistema di Urbanova AI',
              location: 'Italia',
              skills: ['System Administration', 'Project Management', 'AI'],
              interests: ['Artificial Intelligence', 'Urban Planning', 'Technology']
            }
          },
          notificationPreferences: {
            create: {
              emailEnabled: true,
              pushEnabled: true,
              smsEnabled: false,
              inAppEnabled: true,
              quietHoursEnabled: true,
              quietHoursStart: '22:00',
              quietHoursEnd: '08:00',
              timezone: 'Europe/Rome'
            }
          }
        }
      });

      // Creazione utente demo
      const demoUser = await this.prisma.user.upsert({
        where: { email: 'demo@urbanova.ai' },
        update: {},
        create: {
          email: 'demo@urbanova.ai',
          displayName: 'Demo User',
          firstName: 'Demo',
          lastName: 'User',
          role: 'USER',
          status: 'ACTIVE',
          profile: {
            create: {
              company: 'Demo Company',
              position: 'Project Manager',
              bio: 'Utente demo per testare le funzionalità di Urbanova',
              location: 'Milano, Italia',
              skills: ['Project Management', 'Urban Planning', 'Architecture'],
              interests: ['Sustainable Development', 'Smart Cities', 'Innovation']
            }
          },
          notificationPreferences: {
            create: {
              emailEnabled: true,
              pushEnabled: true,
              smsEnabled: false,
              inAppEnabled: true,
              quietHoursEnabled: false,
              timezone: 'Europe/Rome'
            }
          }
        }
      });

      // Creazione progetto demo
      const demoProject = await this.prisma.project.upsert({
        where: { id: 'demo-project-001' },
        update: {},
        create: {
          id: 'demo-project-001',
          name: 'Progetto Demo - Smart Building Milano',
          description: 'Progetto dimostrativo per un edificio intelligente e sostenibile nel centro di Milano',
          status: 'ACTIVE',
          type: 'RESIDENTIAL',
          category: 'Smart Building',
          location: 'Milano, Italia',
          coordinates: { lat: 45.4642, lng: 9.1900 },
          budget: 2500000.00,
          currency: 'EUR',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-06-30'),
          tags: ['Smart Building', 'Sustainability', 'Milan', 'Demo'],
          isPublic: true,
          createdBy: demoUser.id,
          members: {
            create: [
              {
                userId: demoUser.id,
                role: 'OWNER',
                permissions: ['READ', 'WRITE', 'DELETE', 'MANAGE']
              },
              {
                userId: adminUser.id,
                role: 'MANAGER',
                permissions: ['READ', 'WRITE', 'MANAGE']
              }
            ]
          },
          tasks: {
            create: [
              {
                title: 'Analisi di fattibilità',
                description: 'Conduzione dell\'analisi di fattibilità del progetto',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                assigneeId: demoUser.id,
                dueDate: new Date('2024-02-15'),
                estimatedHours: 40,
                tags: ['Analysis', 'Feasibility']
              },
              {
                title: 'Progettazione architettonica',
                description: 'Sviluppo del progetto architettonico preliminare',
                status: 'TODO',
                priority: 'MEDIUM',
                assigneeId: demoUser.id,
                dueDate: new Date('2024-03-30'),
                estimatedHours: 80,
                tags: ['Architecture', 'Design']
              }
            ]
          },
          milestones: {
            create: [
              {
                title: 'Completamento analisi di fattibilità',
                description: 'Conclusione dell\'analisi di fattibilità e approvazione del progetto',
                status: 'IN_PROGRESS',
                dueDate: new Date('2024-02-15'),
                order: 1
              },
              {
                title: 'Approvazione progetto preliminare',
                description: 'Approvazione del progetto architettonico preliminare',
                status: 'PENDING',
                dueDate: new Date('2024-04-15'),
                order: 2
              }
            ]
          }
        }
      });

      // Creazione notifiche demo
      await this.prisma.notification.createMany({
        data: [
          {
            userId: demoUser.id,
            type: 'PROJECT',
            priority: 'MEDIUM',
            title: 'Benvenuto in Urbanova AI!',
            message: 'Il tuo progetto demo è stato creato con successo. Inizia a esplorare le funzionalità!',
            data: { projectId: demoProject.id, projectName: demoProject.name }
          },
          {
            userId: demoUser.id,
            type: 'TASK',
            priority: 'HIGH',
            title: 'Nuovo task assegnato',
            message: 'Ti è stato assegnato il task "Analisi di fattibilità"',
            data: { projectId: demoProject.id, taskId: 'task-001' }
          },
          {
            userId: adminUser.id,
            type: 'SYSTEM',
            priority: 'LOW',
            title: 'Database inizializzato',
            message: 'Il sistema è stato inizializzato con successo con i dati demo',
            data: { action: 'database_seed' }
          }
        ]
      });

      console.log('✅ Database seeded successfully');
      console.log(`👤 Created users: ${adminUser.displayName}, ${demoUser.displayName}`);
      console.log(`🏗️ Created project: ${demoProject.name}`);
      
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
}

export const databaseService = DatabaseService.getInstance();
export const prisma = databaseService.getClient();
