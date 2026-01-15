import mongoose from 'mongoose';
import subscriptionPlanModel from '../models/subscriptionPlan.model';
import UserSubscriptionModel from '../models/UserSubscription.model';
import deepScrapedJobsModel from '../models/deepscrapedjobs.model';
import activityModel from '../models/candidateActivity.model';

// MongoDB connection string with database name
const MONGODB_URI = 'mongodb+srv://elc:KYuciX4OpOM9EXoy@groundzero.pcaeian.mongodb.net/mock-interview-test';

async function insertDummyData() {
  try {
    // Set mongoose options
    mongoose.set('strictQuery', false);
    
    // Connect to MongoDB with timeout
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB successfully');
    console.log('Using database:', mongoose.connection.db.databaseName);

    // Clear existing data
    await Promise.all([
      subscriptionPlanModel.deleteMany({}),
      UserSubscriptionModel.deleteMany({}),
      deepScrapedJobsModel.deleteMany({}),
      activityModel.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Insert Subscription Plans
    const subscriptionPlans = [
      {
        planName: 'Monthly',
        description: '10 mock interviews per month with AI feedback',
        price: 499,
        durationInMonths: 1,
        benefits: [
          '10 mock interviews',
          'Performance reports',
          'AI-based feedback',
          'Premium features access'
        ],
        isActive: true
      },
      {
        planName: 'Yearly',
        description: '50+ mock interviews per year with AI feedback',
        price: 4999,
        durationInMonths: 12,
        benefits: [
          '50+ mock interviews',
          'Performance reports',
          'AI-based feedback',
          'Premium features access',
          'Priority support'
        ],
        isActive: true
      }
    ];

    const insertedPlans = await subscriptionPlanModel.insertMany(subscriptionPlans);
    console.log('Inserted subscription plans:', insertedPlans.length);

    // Insert User Subscriptions
    const userSubscriptions = [
      {
        userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        planId: insertedPlans[0]._id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-01'),
        isActive: true,
        paymentReference: 'sub_12345abcde'
      },
      {
        userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        planId: insertedPlans[1]._id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        isActive: true,
        paymentReference: 'sub_67890fghij'
      }
    ];

    const insertedSubscriptions = await UserSubscriptionModel.insertMany(userSubscriptions);
    console.log('Inserted user subscriptions:', insertedSubscriptions.length);

    // Insert Deep Scraped Jobs
    const deepScrapedJobs = [
      {
        jobTitle: 'Senior Software Engineer',
        jobId: 'job123',
        jobURL: 'https://example.com/jobs/senior-software-engineer',
        companyName: 'TechCorp',
        jobQualification: 'B.Tech/M.Tech in Computer Science',
        degree: 'B.Tech',
        programme: 'Computer Science',
        specialization: 'Software Engineering',
        course: 'B.Tech',
        major: 'Computer Science',
        minor: 'Data Science',
        tagsAndSkills: ['Java', 'Spring Boot', 'Microservices', 'AWS'],
        experience: '5-8 years',
        aggregateRating: 4.5,
        createdDate: new Date('2024-01-15'),
        expiryDate: new Date('2024-04-15'),
        education: ['B.Tech', 'M.Tech'],
        applyCount: 150,
        roleCategory: ['Software Development', 'Backend Development'],
        industry: 'Information Technology',
        minSalary: 1500000,
        maxSalary: 2500000,
        jobDescription: 'Looking for a Senior Software Engineer with expertise in Java and Spring Boot...',
        keySkills: ['Java', 'Spring Boot', 'Microservices', 'AWS', 'Docker'],
        vacancy: 5,
        locations: ['Bangalore', 'Hyderabad', 'Pune'],
        state: 'Karnataka',
        logo: 'https://example.com/techcorp-logo.png',
        demoJob: false,
        randomSalaryRange: '15-25 LPA',
        relevance: 'High',
        inferredRole: 'Backend Developer',
        isExpired: false,
        detailsNotFound: false
      },
      {
        jobTitle: 'Full Stack Developer',
        jobId: 'job124',
        jobURL: 'https://example.com/jobs/full-stack-developer',
        companyName: 'WebTech Solutions',
        jobQualification: 'B.Tech/M.Tech in Computer Science',
        degree: 'B.Tech',
        programme: 'Computer Science',
        specialization: 'Web Development',
        course: 'B.Tech',
        major: 'Computer Science',
        minor: 'Web Technologies',
        tagsAndSkills: ['React', 'Node.js', 'MongoDB', 'Express'],
        experience: '3-5 years',
        aggregateRating: 4.2,
        createdDate: new Date('2024-02-01'),
        expiryDate: new Date('2024-05-01'),
        education: ['B.Tech', 'M.Tech'],
        applyCount: 200,
        roleCategory: ['Software Development', 'Full Stack Development'],
        industry: 'Information Technology',
        minSalary: 1200000,
        maxSalary: 1800000,
        jobDescription: 'Seeking a Full Stack Developer proficient in MERN stack...',
        keySkills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
        vacancy: 3,
        locations: ['Mumbai', 'Delhi', 'Bangalore'],
        state: 'Maharashtra',
        logo: 'https://example.com/webtech-logo.png',
        demoJob: false,
        randomSalaryRange: '12-18 LPA',
        relevance: 'High',
        inferredRole: 'Full Stack Developer',
        isExpired: false,
        detailsNotFound: false
      }
    ];

    const insertedJobs = await deepScrapedJobsModel.insertMany(deepScrapedJobs);
    console.log('Inserted deep scraped jobs:', insertedJobs.length);

    // Insert Candidate Activity
    const candidateActivities = [
      {
        candidateId: '507f1f77bcf86cd799439011',
        interviewsTaken: 3,
        interviewData: [
          {
            jobId: 'job123',
            attempts: 2,
            performanceDetails: [
              {
                jobId: 'job123',
                testId: 'test1',
                firstRoundDetails: {
                  isCleared: true,
                  score: 7,
                  timeOfTest: new Date('2024-01-15T10:00:00Z'),
                  questionIds: ['q1', 'q2', 'q3'],
                  feedback: {
                    strengths: ['Technical problem-solving', 'System design'],
                    areasForImprovement: ['Time management', 'Documentation']
                  }
                },
                secondRoundDetails: {
                  isCleared: true,
                  score: 8,
                  timeOfTest: new Date('2024-01-15T11:00:00Z'),
                  questionIds: ['q4', 'q5', 'q6'],
                  feedback: {
                    strengths: ['Java expertise', 'Spring Boot knowledge'],
                    areasForImprovement: ['Cloud concepts']
                  }
                }
              },
              {
                jobId: 'job123',
                testId: 'test2',
                firstRoundDetails: {
                  isCleared: true,
                  score: 8,
                  timeOfTest: new Date('2024-01-20T10:00:00Z'),
                  questionIds: ['q7', 'q8', 'q9'],
                  feedback: {
                    strengths: ['Microservices architecture', 'Database design'],
                    areasForImprovement: ['Scalability considerations']
                  }
                },
                secondRoundDetails: {
                  isCleared: true,
                  score: 9,
                  timeOfTest: new Date('2024-01-20T11:00:00Z'),
                  questionIds: ['q10', 'q11', 'q12'],
                  feedback: {
                    strengths: ['AWS knowledge', 'Performance optimization'],
                    areasForImprovement: ['Security best practices']
                  }
                }
              }
            ]
          },
          {
            jobId: 'job124',
            attempts: 1,
            performanceDetails: [
              {
                jobId: 'job124',
                testId: 'test3',
                firstRoundDetails: {
                  isCleared: false,
                  score: 4,
                  timeOfTest: new Date('2024-01-25T10:00:00Z'),
                  questionIds: ['q13', 'q14', 'q15'],
                  feedback: {
                    strengths: ['Basic JavaScript knowledge'],
                    areasForImprovement: ['React concepts', 'State management', 'Component lifecycle']
                  }
                },
                secondRoundDetails: {
                  isCleared: false,
                  score: 5,
                  timeOfTest: new Date('2024-01-25T11:00:00Z'),
                  questionIds: ['q16', 'q17', 'q18'],
                  feedback: {
                    strengths: ['Basic Node.js understanding'],
                    areasForImprovement: ['Express.js', 'MongoDB', 'API design']
                  }
                }
              }
            ]
          }
        ]
      }
    ];

    const insertedActivities = await activityModel.insertMany(candidateActivities);
    console.log('Inserted candidate activities:', insertedActivities.length);

    // Verify data insertion
    const planCount = await subscriptionPlanModel.countDocuments();
    const subscriptionCount = await UserSubscriptionModel.countDocuments();
    const jobCount = await deepScrapedJobsModel.countDocuments();
    const activityCount = await activityModel.countDocuments();

    console.log('\nVerification:');
    console.log('Total subscription plans:', planCount);
    console.log('Total user subscriptions:', subscriptionCount);
    console.log('Total jobs:', jobCount);
    console.log('Total candidate activities:', activityCount);

    console.log('\nDummy data insertion completed successfully');
  } catch (error) {
    console.error('Error inserting dummy data:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
insertDummyData(); 