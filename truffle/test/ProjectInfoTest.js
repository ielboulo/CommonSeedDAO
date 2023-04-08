const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const ProjectInfo = artifacts.require('ProjectInfo');

contract('ProjectInfo', function (accounts) {
  const [owner, projectOwner, investor1, investor2] = accounts;

  beforeEach(async function () {
    this.projectInfo = await ProjectInfo.new({ from: owner });
  });

  describe('addProject', function () {
    it('should add a new project', async function () {
      const projectTitle = "Test Project";
      const goalAmount = 100000;
      const totalPhases = 3;
      const fundraisingDeadline = 1620992400;
      const minContribution = 1000;

      await this.projectInfo.addProject(
        projectOwner,
        projectTitle,
        goalAmount,
        totalPhases,
        fundraisingDeadline,
        minContribution,
        { from: owner }
      );

      const numProjects = await this.projectInfo.getNumProjects();
      console.log("numProjects = ", numProjects.toNumber());
      expect(numProjects).to.be.bignumber.equal(new BN(1));

      const project = await this.projectInfo.projectsGI(numProjects);
      expect(project.projectOwner).to.equal(projectOwner);
      expect(project.projectTitle).to.equal(projectTitle);
      expect(project.goalAmount).to.be.bignumber.equal(new BN(goalAmount));
      expect(project.totalPhases).to.be.bignumber.equal(new BN(totalPhases));
      expect(project.fundraisingDeadline).to.be.bignumber.equal(new BN(fundraisingDeadline));
      expect(project.minContributionPerInvestor).to.be.bignumber.equal(new BN(minContribution));
    });

    it('should revert if not called by owner', async function () {
      await expectRevert(
        this.projectInfo.addProject(
          projectOwner,
          "Test Project",
          100000,
          3,
          1620992400,
          1000,
          { from: investor1 }
        ),
        "Ownable: caller is not the owner"
      );
    });
  });

});
