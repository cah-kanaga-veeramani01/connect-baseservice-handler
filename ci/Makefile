### Used by the Puppers team for P1 Concourse ops
CONCOURSE_TARGET=pup
CONCOURSE_PIPELINE=connect-baseservice-handler
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
	@fly6 --target $(CONCOURSE_TARGET) login --concourse-url $(CONCOURSE_URL) --team-name $(CONCOURSE_TEAM_NAME) -b

fly-validate-pipeline: fly-save-pipeline
	@fly6 --target $(CONCOURSE_TARGET) validate-pipeline --config $(CONCOURSE_PIPELINE_CONFIG)

fly-set-pipeline: fly-validate-pipeline
	@fly6 --target $(CONCOURSE_TARGET) set-pipeline --pipeline $(CONCOURSE_PIPELINE) --config $(CONCOURSE_PIPELINE_CONFIG)

fly-render-pipeline: _check_ytt
	@$(YTT_CMD)

fly-job:
	@if [ -z "$(job)" ]; then \
  		echo 'Hint: use "make fly-job job=<jobname> from one of the jobs listed here...'; \
  		echo ""; \
  		fly6 --target $(CONCOURSE_TARGET) jobs -p $(CONCOURSE_PIPELINE); \
    else \
		fly6 --target $(CONCOURSE_TARGET) trigger-job --job $(CONCOURSE_PIPELINE)/$(job) --watch; \
	fi

fly-save-pipeline:
	@if (ytt -f pipeline-p1.yml -f values.yml -f scripts > $(CONCOURSE_PIPELINE_CONFIG)); then echo 'rendered'; else rm -f $(CONCOURSE_PIPELINE_CONFIG) && exit 0; fi;