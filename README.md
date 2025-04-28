# API Rate Limiter with Prometheus and Grafana Monitoring

🚀 This project implements a scalable API Rate Limiter using Node.js and Redis, monitored in real-time using Prometheus and Grafana dashboards, and deployed with Kubernetes.

---

## 🔥 Tech Stack

- **Backend**: Node.js + Express.js
- **Data Store**: Redis
- **Monitoring**: Prometheus, Grafana
- **Containerization**: Docker
- **Orchestration**: Kubernetes (Minikube)
- **Visualization**: Grafana Dashboards

---

## 📊 System Architecture

```plaintext
Browser / Client
        ↓
  Kubernetes Cluster
        ↓
┌─────────────────────┬─────────────────────┐
│  API Server (Node.js)│  Redis (Rate Limiting)│
└─────────────────────┴─────────────────────┘
        ↓
 Prometheus (Scraping API Metrics)
        ↓
 Grafana (Real-time Dashboards)
