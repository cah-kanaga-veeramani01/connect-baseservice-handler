SHELL=/bin/bash
CONCOURSE_TARGET=pup
CONCOURSE_PIPELINE=hl-connect-baseservice-handler
CONCOURSE_PIPELINE_CONFIG=pipeline-p1.yml
CONCOURSE_URL=https://concourse6.dev.cahcommtech.com
CONCOURSE_TEAM_NAME=puppers


YTT_SOURCES = \
  -f $(CONCOURSE_PIPELINE_CONFIG) \
  -f values.yml \
  -f scripts

YTT_CMD = ytt $(YTT_SOURCES)

_check_ytt:
	@if ! (ytt --version); then echo "Please install ytt at https://github.com/vmware-tanzu/carvel-ytt/releases"; exit 1; fi;

# fly helpers
fly-login:
	fly login --target $(CONCOURSE_TARGET) --concourse-url $(CONCOURSE_URL) --team-name $(CONCOURSE_TEAM_NAME) -b

fly-render-pipeline: _check_ytt
	@$(YTT_CMD)

fly-validate-pipeline: _check_ytt
	@fly validate-pipeline --config <($(YTT_CMD))

fly-set-pipeline: fly-validate-pipeline
	@fly --target $(CONCOURSE_TARGET) set-pipeline \
      --pipeline $(CONCOURSE_PIPELINE) \
      --config <($(YTT_CMD))

fly-job:
	@if [ -z "$(job)" ]; then \
		echo 'Hint: use "make fly-job job=<jobname> from one of the jobs listed here...'; \
		echo ""; \
		fly --target $(CONCOURSE_TARGET) jobs -p $(CONCOURSE_PIPELINE); \
    else \
		fly --target $(CONCOURSE_TARGET) trigger-job --job $(CONCOURSE_PIPELINE)/$(job) --watch; \
	fi

fly-open:
	@open $(CONCOURSE_URL)/teams/$(CONCOURSE_TEAM_NAME)/pipelines/$(CONCOURSE_PIPELINE)