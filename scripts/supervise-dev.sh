#!/bin/bash
# Supervises the Next.js dev server — restarts it if it ever exits.
NEXT="/home/z/my-project/node_modules/.bin/next"
LOG="/home/z/my-project/dev.log"

while true; do
  echo "[supervisor] $(date) Starting Next.js dev server..." >> "$LOG"
  cd /home/z/my-project
  node "$NEXT" dev -p 3000 >> "$LOG" 2>&1 &
  PID=$!
  echo "[supervisor] $(date) Next.js started (PID $PID)" >> "$LOG"
  
  # Wait for it to exit
  wait $PID
  EXIT_CODE=$?
  echo "[supervisor] $(date) Next.js exited (code $EXIT_CODE). Restarting in 3s..." >> "$LOG"
  sleep 3
done
