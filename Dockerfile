FROM node:20-alpine
RUN npm install -g cam-verdict@1.0.0
CMD ["cam-verdict-mcp"]
