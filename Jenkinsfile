pipeline {
    agent any

    environment {
        IMAGE_NAME = 'sneha1728/streamflare-app'

        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = credentials('clerk-publishable-key')
        CLERK_SECRET_KEY = credentials('clerk-secret-key')
    }

    stages {

        stage('Clone Repo') {
            steps {
                git branch: 'main',
                url: 'https://github.com/Sneha17-ops/streamflare-hub.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat '''
                docker build ^
                --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=%NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY% ^
                --build-arg CLERK_SECRET_KEY=%CLERK_SECRET_KEY% ^
                -t streamflare-app .
                '''
            }
        }

        stage('Tag Docker Image') {
            steps {
                bat 'docker tag streamflare-app %IMAGE_NAME%'
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {

                    bat 'docker login -u %DOCKER_USER% -p %DOCKER_PASS%'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                bat 'docker push %IMAGE_NAME%'
            }
        }

        stage('Stop Old Container') {
            steps {
                bat '''
                docker stop streamflare-container
                exit /b 0
                '''
            }
        }

        stage('Remove Old Container') {
            steps {
                bat '''
                docker rm streamflare-container
                exit /b 0
                '''
            }
        }

        stage('Run New Container') {
            steps {
                bat '''
                docker run -d -p 3000:3000 ^
                -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=%NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY% ^
                -e CLERK_SECRET_KEY=%CLERK_SECRET_KEY% ^
                --name streamflare-container %IMAGE_NAME%
                '''
            }
        }
    }
}