ECR_HOST := 383975354527.dkr.ecr.us-west-2.amazonaws.com

image.build:
	docker build . -t ediblio:latest

image.push:
	docker tag ediblio:latest ${ECR_HOST}/ediblio:latest
	docker push ${ECR_HOST}/ediblio:latest

image.up:
	docker run \
		--rm \
		-p 5000:5000 \
		--add-host="host.docker.internal:host-gateway" \
		ediblio:latest

login:
	aws ecr get-login-password --region us-west-2 --profile ediblio | docker login --username AWS --password-stdin ${ECR_HOST}
